import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomePart1Component } from './welcome-part-1.component';

describe('WelcomePart1Component', () => {
  let component: WelcomePart1Component;
  let fixture: ComponentFixture<WelcomePart1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomePart1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomePart1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
