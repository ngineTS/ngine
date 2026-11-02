import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-donation',
  imports: [],
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.scss'
})
export class DonationComponent extends NavigationBaseComponent {

  redirectToTipeePage() {
    window.open('https://en.tipeee.com/ngine/', '_blank');
  }
}
