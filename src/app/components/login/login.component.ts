import {Component, OnInit} from "angular2/core";
import {ROUTER_DIRECTIVES, Router, Location} from "angular2/router";

import {AuthService} from "../../shared/services/auth.service";

@Component({
    selector: "login",
    moduleId: "app/components/login/",    // http://schwarty.com/2015/12/22/angular2-relative-paths-for-templateurl-and-styleurls/
    templateUrl: "login.component.html",
    styleUrls: ["login.component.css"]

})
export class LoginComponent implements OnInit {

    private sub: any = null;

    constructor(private _authService: AuthService, private _location: Location, private _router: Router) {

    }

    ngOnInit() {
        this.sub = this._authService.subscribe((val) => {
            if (val.success && val.authenticated) {
                this._location.replaceState("/login");
                this._router.navigate(["Main"]);
            };
        });
    }

    doLogin() {
        this._authService.doLogin();
    }
}