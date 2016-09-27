import "rxjs/Rx";
import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {SPECIES} from "./mocks/raven-mock";
import {Observable} from "rxjs/Observable";

export interface IRavenService {
    getSpecies(): Observable<string[]>;
    // getVarietyTransfers(iids: string[], species: string): Observable<string>;
}

@Injectable()
export class RavenService implements IRavenService {

    private _url = "http://elw2k8itda02.dow.com/RavenAPI_Dev/";

    constructor(private _http: Http) {}

    public getSpecies(): Observable<string[]> {
        return Observable.of(SPECIES);
    }
/**
    public getVarietyTransfers(iids: string[], species: string): Observable<string> {
        return new Observable<string>((resolve, reject) => {

            let url = this._url + "api/RetrieveVarietyTranfers";

            let headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Accept", "application/json");

            let body = "{'Iids': ['B2-0D1-9F2','5B-55F-FDB'],'Species': 'Zea mays'}";

            this._http.post(url, body, { headers: headers })
                .map((res) => res.json())
                .subscribe(
                    (data) => resolve(data),
                    (error) => this._logError(error),
                    () => console.log("getVarietyTransfers()")
                );
        });
    } */

    private _logError(error: string) {
        console.error("There was an error: " + error);
    }
}