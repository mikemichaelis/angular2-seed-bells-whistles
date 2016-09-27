import {Component, OnInit, OnChanges, OnDestroy, SimpleChange} from "@angular/core";
import {Http, Headers, Response} from "@angular/http";
import {Router} from "@angular/router";

import {Auth} from "../../services/auth.service";

@Component({
    selector: "main",
    templateUrl: "app/components/main/main.component.html",
    styleUrls: ["app/components/main/main.component.css"]
})
export class MainComponent implements OnInit, OnChanges, OnDestroy {

    public IsBusy: boolean = false;

    constructor(private _router: Router,  private _http: Http, private _authService: Auth) {}

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    }


}