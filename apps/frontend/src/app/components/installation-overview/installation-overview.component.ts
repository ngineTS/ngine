import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-installation-overview',
  templateUrl: './installation-overview.component.html',
  styleUrls: ['./installation-overview.component.scss'],
})
export class InstallationOverviewComponent extends NavigationBaseComponent {

  constructor() { super(); }

}
