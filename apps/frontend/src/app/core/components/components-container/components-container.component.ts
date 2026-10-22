import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationComponent } from '../navigation/navigation.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take } from 'rxjs';
import { ComponentsContainerService } from '../../services/components-container.service';
import { BannerComponent } from '../banner/banner.component';


@Component({
  selector: 'app-components-container',
  imports: [
    MatTooltipModule, 
    CommonModule, 
    CdkDrag,
    CdkDragHandle,
    MatProgressSpinnerModule,
    MatMenuModule,
    NavigationComponent,
    BannerComponent
  ],
  templateUrl: './components-container.component.html',
  styleUrl: './components-container.component.scss'
})
export class ComponentsContainer implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _containerLayoutService: ContainerLayoutService,
    public _componentsContainerService: ComponentsContainerService,
  ) { }

  /** The components container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** The window height. */
  windowHeight!: number;
  /** Responsive threasold */
  windowWidthLimit = 750;
  /** The HTML container */
  @ViewChild('componentsContainer') componentsContainerRef!: ElementRef<HTMLDivElement>;

  /**
   * Get window size each time it changes (zoom, screen resize...).
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this._componentsContainerService.currentWidthPx = this.componentsContainerRef.nativeElement.offsetWidth;
  }

  /**
   * Lifecyle hook called after the component has been initialized.
   * - retrieve route snapshot data properties
   * - sort navigation children for mobile screen responsivity
   */
  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.navigation = this._route.snapshot.data["navigation"];
    this._componentsContainerService.activeNavigation = this.navigation;

    if (this.windowWidth < this.windowWidthLimit) {
      this.navigation.children?.sort((a, b) => 
        (Number(a.containerLayout.xPos!) + Number(a.containerLayout.yPos!)) 
          - (Number(b.containerLayout.xPos!) + Number(b.containerLayout.yPos!))
      );
    }
  }

  /**
   * Lifecycle hook called after the component view has been initialized.
   */
  ngAfterViewInit() {
    this._componentsContainerService.currentWidthPx = this.componentsContainerRef.nativeElement.offsetWidth;
  }

  
  /**
   * Method called when drag ends.
   * 
   * 1. Get dragged navigation position and convert it to percentage of view port.
   * 2. Update container height if needed
   * 3. Save navigation position
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    /* 1 */
    const position = event.source.getFreeDragPosition();
    const navigationPosition = {
      xPos: Math.round(position.x / window.innerWidth * 10000) / 100,
      yPos: Math.round(position.y / window.innerHeight * 10000) / 100,
    }

    /* 2 */
    this._componentsContainerService.setUpCurrentHeightInPx(
      position.y + (navigation.containerLayout.height! * window.innerHeight / 100)
    );

    /* 3 */
    // Prevent dragging beyond top screen border
    if (navigationPosition.yPos < 0) {
      navigationPosition.yPos = 0;
    }

    // Prevent dragging beyond left screen border
    if (navigationPosition.xPos < 0) {
      navigationPosition.xPos = 0;
    }

    this._containerLayoutService.updateContainerLayout(navigation, navigationPosition)
      .pipe(take(1))
      .subscribe(() => {
        navigation.containerLayout.xPos = navigationPosition.xPos;
        navigation.containerLayout.yPos = navigationPosition.yPos;
      });
  }

}
