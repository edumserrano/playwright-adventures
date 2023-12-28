import { ApplicationConfig } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { routes } from "src/app/app.routes";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations()],
};
