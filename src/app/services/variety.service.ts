import "rxjs/Rx";
import {Injectable} from "@angular/core";
import {Http, Headers, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import {AuthService} from "./auth.service";

import {MATERIAL_CLASSES, MATERIAL_FAMILIES, MATERIAL_TYPES} from "./mocks/variety-mock";
import {ICode} from "../models/icode";

export interface IVarietyService {

    initialize(config: any);
    getMaterialSpecies(): Observable<ICode[]>;
    getMaterialClasses(sourceSystem: number): Observable<ICode[]>;
    getMaterialTypes(sourceSystem: number, materialClass: number): Observable<ICode[]>;
    getMaterialFamilies(sourceSystem: number, materialClass: number): Observable<ICode[]>;
    importSeed(sourceSystem: number, species: number, materialClass: number, materialFamily: number, materialType: number, documentId: number, iids: string[]): Observable<{}>;
}

@Injectable()
export class VarietyService implements IVarietyService {

    private _varietyApiUrl = "http://140.170.226.235/Variety_API_Test/";

    constructor(private _http: Http,  private _authService: AuthService) {}

    public initialize(config: any) {
        if (config.mode !== "DEV") {
            this._varietyApiUrl = config.varietyApiUrl;
        }
    }

    public getMaterialSpecies(): Observable<ICode[]> {

        let url = this._varietyApiUrl + "api/MaterialSpecies";
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this._authService.getSession().access_token}`);

        //

        return <Observable<ICode[]>>this._http.get(url, { headers: headers })
            .map((response: Response) => <ICode[]>response.json().MaterialSpecies)
            .catch(this._handleError);
    }

    public getMaterialClasses(sourceSystem: number): Observable<ICode[]> {

        let url = this._varietyApiUrl + "api/MaterialClasses?sourceSystem=" + sourceSystem;
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this._authService.getSession().access_token}`);

        return <Observable<ICode[]>>this._http.get(url, { headers: headers })
            .map((response: Response) => response.json().MaterialClasses)
            .catch(this._handleError);
    }

    public getMaterialTypes(sourceSystem: number, materialClass: number): Observable<ICode[]> {

        let url = this._varietyApiUrl + "api/MaterialTypes?sourceSystem=" + sourceSystem + "&&materialClass=" + materialClass;
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this._authService.getSession().access_token}`);

        return <Observable<ICode[]>>this._http.get(url, { headers: headers })
            .map((response: Response) => response.json().MaterialTypes)
            .catch(this._handleError);
    }

    public getMaterialFamilies(sourceSystem: number, materialClass: number): Observable<ICode[]> {

        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this._authService.getSession().access_token}`);

        let url = this._varietyApiUrl + "api/MaterialFamilies?sourceSystem=" + sourceSystem + "&materialClass=" + materialClass;

        return <Observable<ICode[]>>this._http.get(url, { headers: headers })
            .map((response: Response) => response.json().MaterialFamilies)
            .catch(this._handleError);
    }

    public importSeed(sourceSystem: number, species: number, materialClass: number, materialFamily: number, materialType: number, documentId: number, iids: string[]): Observable<{}> {

        let url = this._varietyApiUrl + "api/ImportSeed";
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("Authorization", `Bearer ${this._authService.getSession().access_token}`);

        let body = {
            sourceSystem: sourceSystem,
            varietySpecies: species,
            materialClass: materialClass,
            materialFamily: materialFamily,
            materialType: materialType,
            documentId: documentId,
            iids: iids
        };
        let json = JSON.stringify(body);

        return this._http.post(url, json , { headers: headers })
            .map((res) => res.json())
            .catch(this._handleError);
    }

    private _handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || "Server error");
    }

    private _logError(error: string) {
        console.error("There was an error: " + error);
    }
}