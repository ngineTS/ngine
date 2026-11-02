import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocuIntroComponent } from './docu-intro.component';

describe('DocuIntroComponent', () => {
  let component: DocuIntroComponent;
  let fixture: ComponentFixture<DocuIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocuIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocuIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
