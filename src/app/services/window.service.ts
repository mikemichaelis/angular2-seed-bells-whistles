import {Injectable} from "angular2/core";

@Injectable()
export class WindowService {
    constructor() {

    }

    createWindow(url: string, name: string = "Window", width: number = 500, height: number = 700, left: number = 0, top: number = 0) {
        if (url == null) {
            return null;
        }

        let options = `width=${width},height=${height},left=${left},top=${top}`;

        // console.log("Window options: ", options);
        return window.open(url, name, options);
    }
}