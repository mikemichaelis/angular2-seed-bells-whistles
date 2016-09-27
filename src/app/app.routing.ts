import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MainComponent }      from "./components/main/main.component";
import { LoginComponent }      from "./components/login/login.component";

const appRoutes: Routes = [
  {
      path: "",
      redirectTo: "login",
      pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "main",
    component: MainComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
