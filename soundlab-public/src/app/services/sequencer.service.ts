import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Instrument } from '../classes/Interfaces';
import {
  distinct,
  distinctUntilChanged,
  scan,
  shareReplay,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Unsubscriber } from '../classes/Unsubscriber';

@Injectable({
  providedIn: 'root',
})
export class SequencerService extends Unsubscriber {
  readonly addInstrument$ = new Subject<Instrument>();

  /**
   * { [instrumentId in string]: Instrument }
   */
  // readonly instrument$ = this.addInstrument$
  //   .pipe(
  //     scan((instruments: { [key in string]: Instrument }, instrument) => {
  //       return { ...instruments, [instrument.id]: instrument };
  //     }, {}),
  //     tap(console.log),
  //     takeUntil(this.unsubscribe$)
  //   )
  //   .subscribe();

  /**
   * Instrument[]
   */
  readonly instrument$ = this.addInstrument$.pipe(
    distinct((instrument: Instrument) => instrument.id),
    scan(
      (instruments: Instrument[], instrument) => instruments.concat(instrument),
      []
    ),
    shareReplay()
  );

  constructor() {
    super();
  }
}
