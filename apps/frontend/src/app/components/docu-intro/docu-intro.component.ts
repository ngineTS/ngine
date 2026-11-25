import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-docu-intro',
  imports: [RouterLink],
  templateUrl: './docu-intro.component.html',
  styleUrl: './docu-intro.component.scss'
})
export class DocuIntroComponent extends NavigationBaseComponent {

}
