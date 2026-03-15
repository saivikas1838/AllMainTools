import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolscomponentComponent } from './toolscomponent.component';

describe('ToolscomponentComponent', () => {
  let component: ToolscomponentComponent;
  let fixture: ComponentFixture<ToolscomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolscomponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolscomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
