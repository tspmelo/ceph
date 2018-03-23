import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PoolService {

  constructor(private http: HttpClient) {}

  create(pool) {
    return this.http.post('api/pool', pool, { observe: 'response' });
  }

  getList () {
    return this.http.get('api/pool');
  }

  getInfo () {
    return this.http.get('api/pool/_info');
  }

  list(attrs = []) {
    const attrsStr = attrs.join(',');
    return this.http.get(`api/pool?attrs=${attrsStr}`).toPromise().then((resp: any) => {
      return resp;
    });
  }
}
