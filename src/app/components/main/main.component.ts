import {Component, OnInit, OnChanges, OnDestroy, SimpleChange} from "angular2/core";
import {Http, Headers, HTTP_PROVIDERS, Response} from "angular2/http";
import {Router} from "angular2/router";

import {AuthService} from "../../services/auth.service";

@Component({
    selector: "main",
    templateUrl: "app/components/main/main.component.html",
    styleUrls: ["app/components/main/main.component.css"]
})
export class MainComponent implements OnInit, OnChanges, OnDestroy {

    public IsBusy: boolean = false;

    private sub: any = null;

    private logoutUrl: string;

    constructor(private _router: Router, private _authService: AuthService, private _http: Http) {}

    ngOnInit() {

        this.IsBusy = true;

        if (!this._authService.isAuthenticated()) {
            this._router.navigate( ["Login"] );
            return;
        }

        this._authService.subscribe((val) => {
            if (!val.authenticated) {
                this._router.navigate( ["Login"] );
            }
        });
    }

    ngOnDestroy() {
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    }

    get authenticated() {
        return this._authService.isAuthenticated();
    }

    doLogout() {
        this._authService.doLogout();
        // window.location.href = this.logoutUrl;
    }

    get userName() {
        return this._authService.getUserName();
    }
}