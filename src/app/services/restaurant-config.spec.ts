import { TestBed } from '@angular/core/testing';

import { RestaurantConfig } from './restaurant-config';

describe('RestaurantConfig', () => {
  let service: RestaurantConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
