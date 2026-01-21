import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioGeneratorComponent } from './portfolio-generator.component';

describe('PortfolioGeneratorComponent', () => {
  let component: PortfolioGeneratorComponent;
  let fixture: ComponentFixture<PortfolioGeneratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PortfolioGeneratorComponent]
    });
    fixture = TestBed.createComponent(PortfolioGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
