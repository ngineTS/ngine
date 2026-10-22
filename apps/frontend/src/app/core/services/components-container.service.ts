import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";

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
     * The active components container height in px.
     * 
     * It is used for the sticky position of the nav bar in vertical header bar component.
     * As components are absolutely positioned, the height of the components container is unset
     * and vertical header bar container as well, which prevent the navigation bar to be sticky on scroll.
     * We fix this by setting up manually the height based on the deepest navigation.
     * 
     * This property is updated each time a change on component height occurs.
     */
    currentHeightPx: number = 0;

    /**
     * The user global navigation permission.
     */
    userGlobalNavigationPermission: string | undefined;

    /**
     * The active navigation.
     */
    activeNavigation!: Navigation;



    /**
     * Setup active components container height up to navigation bototm edge value.
     * 
     * Add 5px offset to prevent display issue.
     * 
     * @param navigationBottomEdgePx The bottom edge value of the navigation. 
     */
    setUpCurrentHeightInPx(navigationBottomEdgePx: number) {
        if (navigationBottomEdgePx > this.currentHeightPx) {
            this.currentHeightPx = navigationBottomEdgePx + 5;
        }
        console.log(this.currentHeightPx);
    }
}