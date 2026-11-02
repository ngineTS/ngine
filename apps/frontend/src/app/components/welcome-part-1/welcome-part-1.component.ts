import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-welcome-part-1',
  imports: [],
  templateUrl: './welcome-part-1.component.html',
  styleUrl: './welcome-part-1.component.scss'
})
export class WelcomePart1Component extends NavigationBaseComponent {

  constructor(private _router: Router, private _route: ActivatedRoute) { super(); }


  navigateToGithub() {
    window.open('https://github.com/ngineTS/', '_blank');
  }

  navigateToDocumentation() {
    this._router.navigate(['/documentation'], { relativeTo: this._route});
  }

}
