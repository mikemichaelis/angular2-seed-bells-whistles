import {Directive, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";

import {AuthService} from "../services/auth.service";

@Directive({
    selector: "[protected]"
})

export class ProtectedDirective implements OnDestroy {
    private sub: any = null;

    constructor(private authService: AuthService, private router: Router) {
        if (!authService.isAuthenticated()) {
            // this.location.replaceState("/");
            this.router.navigate(["Login"]);
        }

        this.sub = this.authService.subscribe((val) => {
            if (val.authenticated) {
                // this.location.replaceState("/");
                this.router.navigate(["Main"]);
            }
            else {
                // this.location.replaceState("/");
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
