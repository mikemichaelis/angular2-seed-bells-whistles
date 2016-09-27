import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import {AuthService} from "../../services/auth.service";

@Component({
    selector: "login",
    templateUrl: "app/components/login/login.component.html",
    styleUrls: ["app/components/login/login.component.css"]

})
export class LoginComponent implements OnInit {

    private sub: any = null;

    constructor(private _authService: AuthService, private _router: Router) {

    }

    ngOnInit() {
        this.sub = this._authService.subscribe((val) => {
            if (val.success && val.authenticated) {
                // this._location.replaceState("/login");
                this._router.navigate(["main"]);
            };
        });
    }

    doLogin() {
        this._authService.doLogin();
    }
}