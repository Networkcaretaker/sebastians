import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDisplay } from './menu-display';

describe('MenuDisplay', () => {
  let component: MenuDisplay;
  let fixture: ComponentFixture<MenuDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
