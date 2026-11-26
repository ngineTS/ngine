import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-installation-overview',
  templateUrl: './installation-overview.component.html',
  styleUrls: ['./installation-overview.component.scss'],
})
export class InstallationOverviewComponent extends NavigationBaseComponent {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { super(); }

  navigateTo(path: string) {
    this._router.navigateByUrl(`documentation/${path}`);
  }

}
