import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureLibLandingComponent } from './feature-lib-landing.component';

describe('FeatureLibLandingComponent', () => {
  let component: FeatureLibLandingComponent;
  let fixture: ComponentFixture<FeatureLibLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureLibLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureLibLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
