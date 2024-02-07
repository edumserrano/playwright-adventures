type PlaywrightCliOptions = {
  UIMode: boolean;
};

export const playwrightCliOptions: PlaywrightCliOptions = {
  UIMode: process.argv.some(x => x.includes("--ui-host") || x.includes("--ui")),
};
