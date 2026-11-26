import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent extends NavigationBaseComponent {

  constructor() { super(); }

  scrollToTop() {
    const drawerEl = document.querySelector('mat-drawer-content')
    drawerEl!.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
