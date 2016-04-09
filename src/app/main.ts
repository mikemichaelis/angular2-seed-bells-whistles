// http://stackoverflow.com/questions/33332394/angular-2-typescript-cant-find-names
///<reference path="../../node_modules/angular2/typings/browser.d.ts"/>

import "zone.js";
import "reflect-metadata";

import {Component, provide} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {ROUTER_DIRECTIVES, RouteConfig, ROUTER_PROVIDERS, RouterOutlet, PathLocationStrategy, HashLocationStrategy, LocationStrategy} from "angular2/router";
import {COMMON_DIRECTIVES} from "angular2/common";
import {bootstrap} from "angular2/platform/browser";

import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

import "rxjs/add/operator/map";

import "jquery";
import "bootstrap";
import "bootstrap/css/bootstrap.css!";

import {AppComponent} from "./components/app/app.component";

import {WindowService} from "./services/window.service";
import {AuthService} from "./services/auth.service";
import {CookieService} from "./services/cookies.service";

bootstrap(AppComponent, [CookieService, AuthService, WindowService, COMMON_DIRECTIVES, HTTP_PROVIDERS, ROUTER_PROVIDERS]);