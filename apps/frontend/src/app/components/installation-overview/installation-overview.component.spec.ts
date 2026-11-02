import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationOverviewComponent } from './installation-overview.component';

describe('InstallationOverviewComponent', () => {
  let component: InstallationOverviewComponent;
  let fixture: ComponentFixture<InstallationOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallationOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the three architecture components', () => {
    const nodes = fixture.nativeElement.querySelectorAll('.architecture__node');

    expect(nodes.length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Angular');
    expect(fixture.nativeElement.textContent).toContain('NestJS');
    expect(fixture.nativeElement.textContent).toContain('PostgreSQL');
    expect(fixture.nativeElement.textContent).toContain('another supported database');
  });

  it('should link to both installation guides', () => {
    const links = fixture.nativeElement.querySelectorAll('.installation-option');

    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('https://ngine.dev/documentation/installation/docker-compose');
    expect(links[1].getAttribute('href')).toBe('https://ngine.dev/documentation/installation/local');
  });
});
