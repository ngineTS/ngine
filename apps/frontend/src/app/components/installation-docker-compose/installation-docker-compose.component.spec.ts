import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationDockerComposeComponent } from './installation-docker-compose.component';

describe('InstallationDockerComposeComponent', () => {
  let component: InstallationDockerComposeComponent;
  let fixture: ComponentFixture<InstallationDockerComposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallationDockerComposeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallationDockerComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
