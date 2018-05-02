import { TestBed } from '@angular/core/testing';

export class UnitTestHelper {
  staticTestBed(configuration) {
    const resetTestingModule = TestBed.resetTestingModule;
    beforeAll((done) => (async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(configuration);

      await TestBed.compileComponents();

      // prevent Angular from resetting testing module
      TestBed.resetTestingModule = () => TestBed;
    })().then(done).catch(done.fail));
    afterAll(() => {
      TestBed.resetTestingModule = resetTestingModule;
    });
  }
}
