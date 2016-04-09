// http://stackoverflow.com/questions/33332394/angular-2-typescript-cant-find-names
///<reference path="../../node_modules/angular2/typings/browser.d.ts"/>

import "reflect-metadata";

import "rxjs";

import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";

import "jquery";
import "bootstrap";
import "bootstrap/css/bootstrap.css!";
// import "ng2-material";

import {bootstrap} from "angular2/platform/browser";
import {COMMON_DIRECTIVES} from "angular2/common";
import {HTTP_PROVIDERS} from "angular2/http";
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from "angular2/router";

import {WindowService} from "./services/window.service";
import {AuthService} from "./services/auth.service";
import {CookieService} from "./services/cookies.service";

import {AppComponent} from "./components/app/app.component";

bootstrap(AppComponent, [
    COMMON_DIRECTIVES,
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    CookieService,
    AuthService,
    WindowService
]);