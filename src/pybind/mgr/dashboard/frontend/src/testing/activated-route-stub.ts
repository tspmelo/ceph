import { ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double with a `params` observable.
 * Use the `setParams()` method to add the next `params` value.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `params` observable
  private subject = new ReplaySubject<object>();

  /** The mock params observable */
  readonly params = this.subject.asObservable();

  constructor(initialParams?: object) {
    this.setParams(initialParams);
  }

  /** Set the params observables's next value */
  setParams(params?: object) {
    this.subject.next(params);
  }
}
