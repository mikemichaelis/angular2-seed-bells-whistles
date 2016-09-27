import {Component, OnInit, OnChanges, OnDestroy, SimpleChange} from "@angular/core";
import {Http, Headers, Response} from "@angular/http";
import {Router} from "@angular/router";

import {AuthService} from "../../services/auth.service";

import {VarietyService} from "../../services/variety.service";
import {ICode} from "../../models/icode";

@Component({
    selector: "main",
    templateUrl: "app/components/main/main.component.html",
    styleUrls: ["app/components/main/main.component.css"]
})
export class MainComponent implements OnInit, OnChanges, OnDestroy {

    public IsBusy: boolean = false;

    public SelectedMaterialSpecies: number = -1;
    public MaterialSpecies: ICode[];

    public SelectedMaterialClass: number = -1;
    public MaterialClasses: ICode[];

    public SelectedMaterialType: number = -1;
    public MaterialTypes: ICode[];

    public SelectedMaterialFamily: number = -1;
    public MaterialFamilies: ICode[];

    public IIDs: string;

    private sub: any = null;
    private logoutUrl: string;
    private config: any = null;

    constructor(private _router: Router,  private _http: Http, private _varietyService: VarietyService, private _authService: AuthService) {}

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

        this.IIDs = "";

        this._http.get("config/app.config.json")
            .map(res => res.json())
            .subscribe((config: any) => {
                this.config = config;

                this._varietyService.initialize(this.config);

                this._varietyService.getMaterialSpecies().subscribe(
                    (data) => {
                        this.MaterialSpecies = data;
                        this.SelectedMaterialSpecies = null;
                        this.IsBusy = false;
                    },
                    (error) => alert(error));
            });
    }

    ngOnDestroy() {
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    }

    onMaterialSpeciesSelected(materialSpecies: number): void {
        if (materialSpecies && materialSpecies !== this.SelectedMaterialSpecies) {

            this.IsBusy = true;

            this.MaterialClasses = null;
            this.SelectedMaterialClass = -1;
            this.MaterialTypes = null;
            this.SelectedMaterialType = -1;
            this.MaterialFamilies = null;
            this.SelectedMaterialFamily = -1;

            this.SelectedMaterialSpecies = materialSpecies;

            this._varietyService.getMaterialClasses(materialSpecies).subscribe(
                (data) => {
                    this.MaterialClasses = data;
                    this.IsBusy = false;
                },
                (error) => {
                    alert(error);
                    this.IsBusy = false;
                });
        }
    }

    onMaterialClassSelected(materialClass: number): void {
        if (materialClass && materialClass !== this.SelectedMaterialClass) {

            this.IsBusy = true;

            this.MaterialTypes = null;
            this.SelectedMaterialType = -1;
            this.MaterialFamilies = null;
            this.SelectedMaterialFamily = -1;

            this.SelectedMaterialClass = materialClass;

            this._varietyService.getMaterialTypes(this.SelectedMaterialSpecies, materialClass).subscribe(
                (data) => {
                    this.MaterialTypes = data;
                    this.IsBusy = false;
                },
                (error) => {
                    alert(error);
                    this.IsBusy = false;
                });

            this._varietyService.getMaterialFamilies(this.SelectedMaterialSpecies, materialClass).subscribe(
                (data) => {
                    this.MaterialFamilies = data;
                    this.IsBusy = false;
                },
                (error) => {
                    alert(error);
                    this.IsBusy = false;
                });
        }
    }

    onMaterialFamilySelected(materialFamily: number): void {
        if (materialFamily !== this.SelectedMaterialFamily) this.SelectedMaterialFamily = materialFamily;
    }

    onMaterialTypeSelected(materialType: number): void {
        if (materialType !== this.SelectedMaterialType) this.SelectedMaterialType = materialType;
    }

    transfer(): void {

        if (this.IIDs && this.SelectedMaterialSpecies && this.SelectedMaterialClass && this.SelectedMaterialFamily && this.SelectedMaterialType) {

            this.IsBusy = true;

            let iids: string[] = this.IIDs.split(/\r\n|\r|\n/g);
            iids.forEach((iid, i) => iids[i] = iid.trim().toUpperCase());               // Remove leading/trailing whitespace
            iids = iids.filter(iid => iid !== undefined && iid !== null && iid !== ""); // Remove empty lines
            this.IIDs = iids.join("\r");                                                // Update UI with cleaned IID list

            // Get first IID
            let first = iids.shift();
            let iid: string[] = [];
            iid.push(first);

            this._varietyService.importSeed(
                this.config.sourceSystem,
                this.SelectedMaterialSpecies,
                this.SelectedMaterialClass,
                this.SelectedMaterialFamily,
                this.SelectedMaterialType,
                this.config.documentId,
                iid )
                .subscribe(
                    (data: any) =>  {
                        this.transferLog(first, data);
                        if (data.Error !== null) {
                            this.transferError(first, data);
                            this.IsBusy = false;
                        }
                        else {
                            this.IIDs = iids.join("\r");        // Remove successfully processed IID from UI
                            if (iids.length > 0) {

                                // Until JS has async/await, I'm using a simple recursive call to process these asynchrous Observable calls synchronously
                                this.transfer();
                            }
                            else {
                                alert("Transfer Success");
                                this.IsBusy = false;
                            }
                        }
                    },
                    (error) => {
                        alert(error);
                        this.IsBusy = false;
                    });
        }
    }

    private transferLog(iid: string, result: any): void {
        console.log("Transfer Log");
        console.log("IID  : " + iid);
        console.log("Error: " + result.Error);
        console.log("Lines: " + JSON.stringify(result.Lines));
        console.log("Debug: " + JSON.stringify(result.Debug));
    }

    private transferError(iid: string, result: any): void {
        alert(iid + ": " + result.Error);
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