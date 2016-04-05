import {Injectable, EventEmitter} from "angular2/core";
import {Http, Headers} from "angular2/http";

import {WindowService} from "./window.service";

@Injectable()
export class AuthService {
    private oAuthCallbackUrl: string;
    private oAuthTokenUrl: string;
    private oAuthUserUrl: string;
    private oAuthUserNameField: string;
    private logoutUrl: string;
    private authenticated: boolean = false;
    private token: string;
    private expires: any = 0;
    private userInfo: any = {};
    private windowHandle: any = null;
    private intervalId: any = null;
    private expiresTimerId: any = null;
    private loopCount = 600;
    private intervalLength = 100;

    private locationWatcher = new EventEmitter();  // @TODO: switch to RxJS Subject instead of EventEmitter
    private subscription;

    constructor(private windows: WindowService, private http: Http) {
        http.get("config/app.config.json")
            .map(res => res.json())
            .subscribe((config: any) => {
                this.oAuthCallbackUrl = config.callbackUrl;
                this.oAuthTokenUrl = config.implicitGrantUrl;
                this.oAuthTokenUrl = this.oAuthTokenUrl
                    .replace("__callbackUrl__", config.callbackUrl)
                    .replace("__clientId__", config.clientId)
                    .replace("__scopes__", config.scopes);
                this.oAuthUserUrl = config.userInfoUrl;
                this.oAuthUserNameField = config.userInfoNameField;
            });
    }

    public subscribe(onNext: (value: any) => void, onThrow?: (exception: any) => void, onReturn?: () => void) {
        return this.locationWatcher.subscribe(onNext, onThrow, onReturn);
    }

    public doLogin() {
        let loopCount = this.loopCount;
        this.windowHandle = this.windows.createWindow(this.oAuthTokenUrl, "OAuth2 Login", 500, 650);

        this.intervalId = setInterval(() => {
            if (loopCount-- < 0) {
                clearInterval(this.intervalId);
                this.emitAuthStatus(false);
                this.windowHandle.close();
            } else {
                let href: string;
                try {
                    href = this.windowHandle.location.href;
                } catch (e) {
                    // console.log("Error:", e);
                }
                if (href != null) {
                    let re = /id_token=(.*)/;
                    let found = href.match(re);
                    if (found) {
                        console.log("Callback URL:", href);
                        clearInterval(this.intervalId);
                        let parsed = this.parse(href.substr(this.oAuthCallbackUrl.length + 1));
                        let expiresSeconds = Number(parsed.expires_in) || 1800;

                        this.token = parsed.access_token;
                        if (this.token) {
                            this.authenticated = true;
                        }

                        this.startExpiresTimer(expiresSeconds);
                        this.expires = new Date();
                        this.expires = this.expires.setSeconds(this.expires.getSeconds() + expiresSeconds);

                        this.windowHandle.close();
                        this.emitAuthStatus(true);
                        this.fetchUserInfo();

                        this.http.get("config/app.config.json")
                            .map(res => res.json())
                            .subscribe((config: any) => {
                                this.logoutUrl = config.logoutUrl
                                    .replace("__token__", this.getSession().token)
                                    .replace("__logoutCallbackUrl__", config.logoutCallbackUrl);
                            });
                    }
                }
            }
        }, this.intervalLength);
    }

    public isAuthenticated() {
        return this.authenticated;
    }

    public getSession() {
        return {authenticated: this.authenticated, token: this.token, expires: this.expires};
    }

    public getUserInfo() {
        return this.userInfo;
    }

    public getUserName() {
        return this.userInfo ? this.userInfo[this.oAuthUserNameField] : null;
    }

    public doLogout() {
        this.clearSession();
        this.emitAuthStatus(true);
        this.windowHandle = this.windows.createWindow(this.logoutUrl, "OAuth2 Logout", 500, 300);
    }

    private clearSession() {
        this.authenticated = false;
        this.expiresTimerId = null;
        this.expires = 0;
        this.token = null;
        this.emitAuthStatus(true);
        console.log("Session has been cleared");
    }

    private fetchUserInfo() {
        if (this.token != null) {
            let headers = new Headers();
            headers.append("Authorization", `Bearer ${this.token}`);
            this.http.get(this.oAuthUserUrl, {headers: headers})
                .map(res => res.json())
                .subscribe(info => {
                    this.userInfo = info;
                    console.log("Retrieved user info: ", info);
                }, err => {
                    console.error("Failed to fetch user info: ", err);
                });
        }
    }

    private startExpiresTimer(seconds: number) {
        if (this.expiresTimerId != null) {
            clearTimeout(this.expiresTimerId);
        }
        this.expiresTimerId = setTimeout(() => {
            console.log("Session has expired");
            this.doLogout();
        }, seconds * 1000);
        console.log("Token expiration timer set for", seconds, "seconds");
    }

    private parse(str) { // lifted from https://github.com/sindresorhus/query-string
        if (typeof str !== "string") {
            return {};
        }

        str = str.trim().replace(/^(\?|#|&)/, "");

        if (!str) {
            return {};
        }

        return str.split("&").reduce(function (ret, param) {
            let parts = param.replace(/\+/g, " ").split("=");
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            let key = parts.shift();
            let val = parts.length > 0 ? parts.join("=") : undefined;

            key = decodeURIComponent(key);

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };

    private emitAuthStatus(success: boolean) {
        this.locationWatcher.emit({success: success, authenticated: this.authenticated, token: this.token, expires: this.expires});
    }
}

