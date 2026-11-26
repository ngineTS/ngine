import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureAnalyticComponent } from './feature-analytic.component';

describe('FeatureAnalyticComponent', () => {
  let component: FeatureAnalyticComponent;
  let fixture: ComponentFixture<FeatureAnalyticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAnalyticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureAnalyticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
