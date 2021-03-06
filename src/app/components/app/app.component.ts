import {Component} from "angular2/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";

import {LoginComponent} from "../login/login.component";
import {MainComponent} from "../main/main.component";

@Component({
    selector: "app",
    templateUrl: "app/components/app/app.component.html",
    styleUrls: ["app/components/app/app.component.css"],
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    {path: "/login", name: "Login", component: LoginComponent, useAsDefault: true},
    {path: "/main", name: "Main", component: MainComponent},
])
export class AppComponent {}