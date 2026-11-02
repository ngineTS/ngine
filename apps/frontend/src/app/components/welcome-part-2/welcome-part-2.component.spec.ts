import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomePart2Component } from './welcome-part-2.component';

describe('WelcomePart2Component', () => {
  let component: WelcomePart2Component;
  let fixture: ComponentFixture<WelcomePart2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomePart2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomePart2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
