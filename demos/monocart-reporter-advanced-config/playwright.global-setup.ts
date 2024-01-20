import { FullConfig } from "@playwright/test";
import { env } from "playwright.env-vars";
import { simpleGit } from "simple-git";

// See https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown

interface LastCommitMetadata {
  hash: string;
  refs: string;
  author: string;
  date: string;
  message: string;
}

interface RepositoryMetadata {
  repoUrl: string;
  browseCommitFilesUrl: string;
}

class CodeMetadataProvider {
  private _lastCommitMetadata: LastCommitMetadata | null = null;
  private _repositoryMetadata: RepositoryMetadata | null = null;

  public async getLastCommitMetadataAsync(): Promise<LastCommitMetadata | null> {
    const isRepo = await simpleGit().checkIsRepo();
    if (!isRepo) {
      return null;
    }

    if (this._lastCommitMetadata !== null) {
      return this._lastCommitMetadata;
    }

    const lastCommitAuthorCommand = ["log", "-1", "--format=%an %ae"];
    const lastCommitAuthorName = await simpleGit().raw(lastCommitAuthorCommand);
    const lastCommitHashCommand = ["log", "-1", "--format=%H"];
    const lastCommitHash = await simpleGit().raw(lastCommitHashCommand);
    const lastCommitDateCommand = ["log", "-1", "--format=%ad"];
    const lastCommitDate = await simpleGit().raw(lastCommitDateCommand);
    const lastCommitRefsCommand = ["log", "-1", "--format=%D"];
    const lastCommitRefs = await simpleGit().raw(lastCommitRefsCommand);
    const lastCommitMessageCommand = ["log", "-1", "--format=%s"];
    const lastCommitMessage = await simpleGit().raw(lastCommitMessageCommand);

    const lastCommitMetadata: LastCommitMetadata = {
      hash: lastCommitHash.trim(),
      refs: lastCommitRefs.trim(),
      author: lastCommitAuthorName.trim(),
      date: lastCommitDate.trim(),
      message: lastCommitMessage.trim(),
    };
    this._lastCommitMetadata = lastCommitMetadata;
    return lastCommitMetadata;
  }

  public async getRepoMetadataAsync(): Promise<RepositoryMetadata | null> {
    const isRepo = await simpleGit().checkIsRepo();
    if (!isRepo) {
      return null;
    }

    if (this._repositoryMetadata !== null) {
      return this._repositoryMetadata;
    }

    const originUrlCommand = ["remote", "get-url", "--push", "origin"];
    const originUrlRaw = await simpleGit().raw(originUrlCommand);
    const originUrl = originUrlRaw.trim().replace(".git", "");
    const lastCommitMetadata = await this.getLastCommitMetadataAsync();
    if (!lastCommitMetadata) {
      return null;
    }

    const repositoryMetadata: RepositoryMetadata = {
      repoUrl: originUrl,
      browseCommitFilesUrl: `${originUrl}/tree/${lastCommitMetadata!.hash}`,
    };
    this._repositoryMetadata = repositoryMetadata;
    return repositoryMetadata;
  }
}

async function globalSetup(config: FullConfig): Promise<void> {
  const codeProvider = new CodeMetadataProvider();
  const metadata = config.metadata;
  metadata["ci"] = env.CI ? "yes" : "no";
  metadata["worker-count"] = config.workers;
  metadata["max-failures"] = config.maxFailures;
  metadata["retries"] = config.projects[0].retries;

  const repoMetadata = await codeProvider.getRepoMetadataAsync();
  if (repoMetadata) {
    metadata["repo-url"] = repoMetadata.repoUrl;
    metadata["browse-files-url"] = repoMetadata.browseCommitFilesUrl;
  }

  const lastCommitMetadata = await codeProvider.getLastCommitMetadataAsync();
  if (lastCommitMetadata) {
    metadata["commit-message"] = lastCommitMetadata.message;
    metadata["commit-author"] = lastCommitMetadata.author;
    metadata["commit-date"] = lastCommitMetadata.date;
    metadata["commit-hash"] = lastCommitMetadata.hash;
    metadata["commit-refs"] = lastCommitMetadata.refs;
  }
}

export default globalSetup;
