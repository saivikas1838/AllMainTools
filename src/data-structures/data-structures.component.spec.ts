import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStructuresComponent } from './data-structures.component';

describe('DataStructuresComponent', () => {
  let component: DataStructuresComponent;
  let fixture: ComponentFixture<DataStructuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataStructuresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataStructuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
