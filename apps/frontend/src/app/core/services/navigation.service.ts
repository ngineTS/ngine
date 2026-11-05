import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { environment } from "../../../environments/environment";
import { retry, take, tap } from "rxjs";
import { NavigationManagementComponent } from "../components/navigation-management/navigation-management.component";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "./snackbar.service";
import { Route } from "@angular/router";

export type UpdateReturnType = {
    affected: number;
    generatedMaps: Array<unknown>;
    raw: Array<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

    constructor(
        private _http: HttpClient,
        private _matDialog: MatDialog,
        private _snackbarService: SnackBarService,
    ) { }

    navigationsWithChangesList = new Map<string, Navigation>();

    /**
     * Get navigations and their children.
     * 
     * @returns An observable of navigations.
     */
    getNestedNavigations() {
        return this._http.get<{
            navigation: Navigation,
            access_token: string,
        }>(`${environment.APIURL}navigation`).pipe(take(1));
    }

    /**
     * Get flatten navigations.
     * 
     * @returns An observable of all navigations and their children.
     */
    getFlatNavigations() {
        return this._http.get<Navigation[]>(`${environment.APIURL}navigation/flat`)
            .pipe(take(1), retry(1));
    }

    /**
     * Save navigation.
     * 
     * If y position is provided, it will be used to set the position of the new navigation.
     * 
     * @param navigations The navigations to save.
     * @param yPos The y position for the new navigation (optional).
     * @returns An observable of the navigation saved.
     */
    saveNavigation(navigations: Navigation, yPos?: number) {
        if(!yPos) {
            return this._http.post<{ navigation: Navigation, access_token: string }>(`${environment.APIURL}navigation`, navigations);
        }

        const params = new HttpParams().set('yPos', yPos);
        return this._http.post<{ navigation: Navigation, access_token: string }>(`${environment.APIURL}navigation`, navigations, { params });
    }

    /**
     * Update navigation properties.
     * 
     * @param navigationId The navigation id to update.
     * @param navigationProps The navigation properties to update.
     * @returns An observable of UpdateReturnType object.
     */
    updateNavigation(navigationId: string, navigationProps: Partial<Navigation>) {
        return this._http.patch<UpdateReturnType>(`${environment.APIURL}navigation/${navigationId}`, navigationProps);
    }

    /**
     * Update array of navigation properties.
     * 
     * @param navigationsProps Array of navigation properties to update.
     * @returns Array of navigation properties updated.
     */
    bulkUpdateNavigations(navigationsProps: Array<Partial<Navigation>>) {
        return this._http.post<Partial<Navigation>[]>(`${environment.APIURL}navigation/bulk-update`, navigationsProps)
            .pipe(take(1));
    }

    /**
     * Delete navigation and children.
     * 
     * @param navigation The navigation to delete.
     * @returns An observable of UpdateReturnType object.
     */
    deleteNavigationAndChildren(navigation: Navigation) {
        return this._http.post(`${environment.APIURL}navigation/delete`, navigation);
    }

    /**
     * Open navigation managenement form to add or edit navigation.
     * If navigation is provided then edit navigation else add navigation.
     * 
     * @param parent The parent navigation.
     * @param navigation The navigation to edit.
     * @param yPos The y position for the new navigation (optional).
     * @param parentRoute The parent route.
     */
    manageNavigation(
        parent: Navigation,
        navigation?: Navigation,
        yPos?: number,
        parentRoute?: Route | null
    ) {
        const dialogRef = this._matDialog.open(NavigationManagementComponent, {
            data: { yPos, navigation, parent }
        });

        dialogRef.afterClosed().subscribe((navigationValue: Partial<Navigation>) => {
            if (navigationValue) {
                //edit case: assign new property to navigation provided and update unpublishedChanges store.
                if (navigation) {
                    navigation.unpublishedChanges.push('navigation');
                    this.navigationsWithChangesList.set(navigation.id, navigation);
                    for (const [key, value] of Object.entries(navigationValue)) {
                        navigation[key] = value;
                    }
                } 
                //add case: 
                // - navigation has an id so update directly unpublishedChanges store.
                // - if navigation is redirect-button then creat new route under parent route.
                else {
                    this.navigationsWithChangesList.set(navigationValue.id!, navigationValue as Navigation);
                    if (navigationValue.navigationType!.name === 'redirect-button') {
                        const newRoute: Route = {
                            path: navigationValue.name,
                            data: { navigation: navigationValue },
                            children: [
                                {
                                    path: '',
                                    loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
                                }
                            ]
                        }
                        parentRoute?.children ? parentRoute.children.push(newRoute) : parentRoute!.children = [newRoute];
                    }
                }
            }
        });
    }

    /**
     * Recursively sort navigations by order.
     */
    sortNavigationsByOrder(navigation: Navigation) {
        navigation.children?.sort((a, b) => a.order - b.order);
        navigation.children?.forEach(child => 
            child.children?.sort((a, b) => a.order - b.order)
        );
    }

    /**
     * Publish navigation.
     * 
     * @param navigation The navigation to publish.
     * @returns An observable of the success message.
     */
    publishNavigationChanges(navigation: Navigation) {
        this._http
            .get<{ message: string }>(`${environment.APIURL}navigation/publish/${navigation.groupId}`)
            .pipe(take(1))
            .subscribe(() => {
                navigation.unpublishedChanges = [];
                this.navigationsWithChangesList.delete(navigation.id);
                this._snackbarService.showSuccessSnackBar('Element published successfully.');
            });
            
    }

    /**
     * Cancel navigation changes.
     * 
     * @param navigation The navigation to cancel changes.
     * @returns An observable of the navigation updated.
     */
    cancelNavigationChanges(navigation: Navigation) {
        this._http
            .get<Navigation>(`${environment.APIURL}navigation/cancel/${navigation.groupId}`)
            .pipe(take(1))
            .subscribe(resp => {
                Object.assign(navigation, resp);
                navigation.unpublishedChanges = [];
                this.navigationsWithChangesList.delete(navigation.id);
                this._snackbarService.showSuccessSnackBar('Changes cancelled successfully.');
            });
    }

    /**
     * Publish all navigations.
     * 
     * @param navigationGroupIds The list of navigation group id.
     * @returns An observable of success message.
     */
    publishAllNavigations(navigationGroupIds: Array<string>) {
        return this._http
            .post<{ message: string }>(`${environment.APIURL}navigation/publish-all`, navigationGroupIds)
            .pipe(
                take(1),
                tap({ next: () => {
                    this.navigationsWithChangesList.clear();
                    this._snackbarService.showSuccessSnackBar('Elements published successfully.')
                }})
            );
    }

    getAllRedirectButtons() {
        return this._http.get<Array<Navigation>>(`${environment.APIURL}navigation/redirect-buttons`)
            .pipe(
                take(1),
                retry(1)
            );
    }

}