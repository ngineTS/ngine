import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-installation-local',
  templateUrl: './installation-local.component.html',
  styleUrls: ['./installation-local.component.scss'],
})
export class InstallationLocalComponent extends NavigationBaseComponent {

  constructor() { super(); }

}
