import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ComponentsContainerService {

    constructor() {}

    /** 
     * The active components container width in px.
     * 
     * It is used in navigation component to make the box fit the full available width 
     * via the 'full screen' button.
     */
    currentWidthPx: number | undefined;

    /**
     * The user global navigation permission.
     */
    userGlobalNavigationPermission: string | undefined;

    /**
     * The active navigation.
     */
    activeNavigation!: Navigation;

    /**
     * The parent route of the component container. For instance for WELCOME page, the parent route is WELCOME.
     */
    parentRoute: Route | undefined | null;
}