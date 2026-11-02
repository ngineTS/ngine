import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ComponentService {

  /**
   * Application components store.
   * 
   * Map navigation type name with function reference to component import.
   * 
   * The key has to match navigation type name.
   */
  readonly componentStore: Record<string, () => Promise<any>> = {
    "my-quill-editor": () => import('./my-quill-editor/my-quill-editor.component'),
    "calendar": () => import('./calendar/calendar.component'),
    "content-visualization": () => import('./content-visualization/content-visualization.component'),
    "analytic": () => import('./analytic/analytic.component'),
    "media-library": () => import('./media-library/media-library.component'),
    "user-management": () => import('./user-management/user-management.component'),
    "role-management": () => import('./role-management/role-management.component'),
    "sign-container": () => import('./sign-container/sign-container.component'),
    "simple-shape": () => import('./simple-shape/simple-shape.component'),
    "media": () => import('./media/media.component'),
    "reusable-card-list": () => import('./reusable-card-list/reusable-card-list.component'),
    "authentication-management": () => import('./authentication-management/authentication-management.component'),
    "banner-management": () => import('./banner-management/banner-management.component'),
    "ngine-guide": () => import('./ngine-guide/ngine-guide.component'),
    "welcome-part-1": () => import('./welcome-part-1/welcome-part-1.component'),
    "welcome-part-2": () => import('./welcome-part-2/welcome-part-2.component'),
    "donation": () => import('./donation/donation.component'),
    "new-version": () => import('./new-version/new-version.component'),
    "footer": () => import('./footer/footer.component'),
    "feature-analytic": () => import('./feature-analytic/feature-analytic.component'),
    "feature-description": () => import('./feature-description/feature-description.component'),
    "docu-intro": () => import('./docu-intro/docu-intro.component'),
    "feature-lib-landing": () => import('./feature-lib-landing/feature-lib-landing.component'),
    "contact": () => import('./contact/contact.component'),
    'installation-overview': () => import('./installation-overview/installation-overview.component'),
    'installation-docker-compose': () => import('./installation-docker-compose/installation-docker-compose.component'),
    'installation-local': () => import('./installation-local/installation-local.component'),
};

  /**
   * Classify a string (ex: my-string --> MyString).
   * 
   * @param str The string to transform.
   * @returns A string in pascale case.
   */
  classify(str: string): string {
    return str
      .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

}