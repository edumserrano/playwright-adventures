type PlaywrightCliOptions = {
  UIMode: boolean,
}

export const playwrightCliOptions: PlaywrightCliOptions = {
  UIMode: process.argv.includes("--ui"),
}
