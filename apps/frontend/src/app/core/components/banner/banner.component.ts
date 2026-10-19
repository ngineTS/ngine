import { Component, Input } from '@angular/core';
import { BannerService } from '../../services/banner.service';
import { Banner } from '../../models/banner.interface';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {

  constructor(private _bannerService: BannerService) {}

  /** The navigation group ID for which to display a banner. */
  @Input() navigationGroupId!: string;
  /** The banner associated to the navigation if exists. */
  banner: Banner | null = null;

  /**
   * Lifecyle hook called after the component has been initialized.
   * 
   * Get banner if exists for the given navigationGroupId.
   */
  ngOnInit() {
    this._bannerService.getBannerByNavigationGroupId(this.navigationGroupId)
      .subscribe(banner => {
        this.banner = banner;
      });
  }

}
