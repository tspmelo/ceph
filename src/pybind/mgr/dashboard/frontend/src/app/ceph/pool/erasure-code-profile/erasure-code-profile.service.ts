import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ErasureCodeProfileService {

  constructor(private http: HttpClient) {}

  getList () {
    return this.http.get('api/erasure_code_profile');
  }
}
