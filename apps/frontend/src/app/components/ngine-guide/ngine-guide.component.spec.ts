import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgineGuideComponent } from './ngine-guide.component';

describe('NgineGuideComponent', () => {
  let component: NgineGuideComponent;
  let fixture: ComponentFixture<NgineGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgineGuideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgineGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
