import {Directive, OnDestroy} from "angular2/core";
import {ROUTER_DIRECTIVES, Router, Location} from "angular2/router";

import {AuthService} from "../services/auth.service";

@Directive({
    selector: "[protected]"
})

export class ProtectedDirective implements OnDestroy {
    private sub: any = null;

    constructor(private authService: AuthService, private router: Router, private location: Location) {
        if (!authService.isAuthenticated()) {
            this.location.replaceState("/");
            this.router.navigate(["Login"]);
        }

        this.sub = this.authService.subscribe((val) => {
            if (val.authenticated) {
                this.location.replaceState("/");
                this.router.navigate(["RSVT"]);
            }
            else {
                this.location.replaceState("/");
                this.router.navigate(["Login"]);
            }

        });
    }

    ngOnDestroy() {
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
    }
}
