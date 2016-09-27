// http://stackoverflow.com/questions/33332394/angular-2-typescript-cant-find-names
/* IE required polyfills, in this exact order */
import "core-js/shim";
import "jspm_packages/system-polyfills";
// import "@angular/es6/dev/src/testing/shims_for_IE";

import "reflect-metadata";
import "zone.js";
// import "rxjs";

// Twitter Bootstrap
// import "bootstrap";

import { NgModule }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule }    from "@angular/forms";
import { HttpModule } from "@angular/http";

import { routing } from "./app.routing";

import { AppComponent } from "./components/app/app.component";
import { LoginComponent } from "./components/login/login.component";
import { MainComponent } from "./components/main/main.component";

import { AuthService } from "./services/auth.service";
import { VarietyService } from "./services/variety.service";
// import { RavenService } from "./services/raven.service";
import { WindowService } from "./services/window.service";
import { CookieService } from "./services/cookies.service";

@NgModule({
  imports: [ BrowserModule, FormsModule, HttpModule, routing ],
  declarations: [ AppComponent, LoginComponent, MainComponent ],
  providers: [ VarietyService, WindowService, AuthService, CookieService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
