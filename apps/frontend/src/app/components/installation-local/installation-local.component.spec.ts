import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationLocalComponent } from './installation-local.component';

describe('InstallationLocalComponent', () => {
  let component: InstallationLocalComponent;
  let fixture: ComponentFixture<InstallationLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallationLocalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallationLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
