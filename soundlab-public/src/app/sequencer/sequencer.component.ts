import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SequencerService } from '../services/sequencer.service';
import { Unsubscriber } from '../classes/Unsubscriber';
import {
  map,
  shareReplay,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  Instrument,
  PadsIndex,
  SequencerConfig,
  Step,
} from '../classes/Interfaces';
import { combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.less'],
})
export class SequencerComponent extends Unsubscriber implements OnInit {
  ObjectKeys = Object.keys;
  toNumber = Number;

  readonly instruments$ = this.sequencerService.instruments$;

  readonly sequencerStep$ = this.sequencerService.step$;

  /**
   * Pads index stream
   */
  padsIndex$: Observable<PadsIndex> = combineLatest([
    this.sequencerService.configUpdated$,
    this.instruments$,
  ]).pipe(
    map(([sequencerConfig, instruments]) =>
      this.getPadsIndex(sequencerConfig, instruments)
    ),
    shareReplay(1)
  );

  /**
   * Force to detect changes to let the view knows the current step.
   */
  readonly detectChangesOnActiveStep$ = this.sequencerService.step$.pipe(
    tap(() => this.cdr.detectChanges()),
    takeUntil(this.unsubscribe$)
  );

  /**
   * Hit checked pads when tick is passing on them
   */
  readonly hitPads$ = this.sequencerStep$.pipe(
    withLatestFrom(this.padsIndex$),
    tap(([step, padsIndex]) => this.hitPads(step, padsIndex)),
    takeUntil(this.unsubscribe$)
  );

  constructor(
    public sequencerService: SequencerService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    this.padsIndex$.subscribe();
  }

  ngOnInit(): void {
    this.detectChangesOnActiveStep$.subscribe();
    this.hitPads$.subscribe();
  }

  /**
   * Get pad index for all instruments
   */
  private getPadsIndex(
    sequencerConfig: SequencerConfig,
    instruments: Instrument[]
  ): PadsIndex {
    return instruments.reduce((padsIndex, instrument) => {
      return {
        ...padsIndex,
        [instrument.id]: Object.values(instrument.partsObj).reduce(
          (partsPadsIndex, instrumentPart) => {
            return {
              ...partsPadsIndex,
              [instrumentPart.id]: this.getPads(sequencerConfig),
            };
          },
          {}
        ),
      };
    }, {});
  }

  /**
   * Build pads for the given sequencer config
   */
  private getPads(
    sequencerConfig: SequencerConfig
  ): {
    [bar in number]: {
      [hit in number]: boolean;
    };
  } {
    const hits = Object.assign(
      {},
      Array(sequencerConfig.hitsPerBar + 1).fill(false)
    );
    delete hits[0];

    const bars = Object.assign({}, Array(sequencerConfig.bars + 1).fill(hits));
    delete bars[0];
    // Clone pads to make sure inputs' binding are independent
    return JSON.parse(JSON.stringify(bars));
  }

  private hitPads(step: Step, padsIndex: PadsIndex): void {
    this.sequencerService.hits['drum-kit']['ding-bell'].next();
    // this.sequencerService.hits['drum-kit']['shaker'].next();
    const hits = padsIndex;
  }
}
