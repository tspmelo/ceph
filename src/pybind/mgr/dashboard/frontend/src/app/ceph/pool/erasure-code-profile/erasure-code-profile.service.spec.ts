import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ErasureCodeProfileService } from './erasure-code-profile.service';

describe('ErasureCodeProfileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErasureCodeProfileService],
      imports: [
        HttpClientTestingModule
      ],
    });
  });

  const useService = (fn) => inject([ErasureCodeProfileService], fn);

  it('should be created', useService((service: ErasureCodeProfileService) => {
    expect(service).toBeTruthy();
  }));
});
