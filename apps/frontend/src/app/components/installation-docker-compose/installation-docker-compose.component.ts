import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-installation-docker-compose',
  templateUrl: './installation-docker-compose.component.html',
  styleUrls: ['./installation-docker-compose.component.scss'],
})
export class InstallationDockerComposeComponent extends NavigationBaseComponent {

  constructor() { super(); }

}
