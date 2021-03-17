import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Instrument, SequencerConfig, Step } from '../classes/Interfaces';
import {
  debounceTime,
  distinct,
  scan,
  shareReplay,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Unsubscriber } from '../classes/Unsubscriber';
import * as Tone from 'tone';

@Injectable({
  providedIn: 'root',
})
export class SequencerService extends Unsubscriber {
  /**
   * Browser need user to do something on the web page to allow Tone to be executed.
   */
  userAction = false;

  /**
   * Sequencer config
   */
  readonly config: SequencerConfig = {
    hitsPerBar: 8,
    bars: 4,
    tempo: 120,
    currentStep: {
      hit: 1,
      bar: 1,
    },
  };

  /**
   * Instruments stream.
   */
  readonly addInstrument$ = new Subject<Instrument>();

  /**
   * Stores all registered instruments
   */
  readonly instrument$ = this.addInstrument$.pipe(
    distinct((instrument: Instrument) => instrument.id),
    scan(
      (instruments: Instrument[], instrument) => instruments.concat(instrument),
      []
    ),
    takeUntil(this.unsubscribe$),
    shareReplay()
  );

  /**
   * Config updates stream.
   */
  readonly updateConfig$ = new Subject<void>();

  /**
   * Debounce time the config changes to avoid Tone.Transport slowdowns
   */
  readonly configUpdated$ = this.updateConfig$.pipe(
    debounceTime(200),
    tap(() => this.updateConfig()),
    takeUntil(this.unsubscribe$)
  );

  readonly step$ = new BehaviorSubject<Step>(this.config.currentStep);

  constructor() {
    super();
    this.configUpdated$.subscribe();
  }

  /**
   * Init the sequencer
   */
  private init(): void {
    if (!this.userAction) Tone.start();
    Tone.Transport.scheduleRepeat(
      this.hit.bind(this),
      `${this.config.hitsPerBar}n`
    );
  }

  /**
   * Refresh the sequencer's config.
   */
  updateConfig(): void {
    Tone.Transport.cancel();
    this.init();
    Tone.Transport.bpm.value = this.config.tempo;
  }

  /**
   * Start the sequencer
   */
  start(): void {
    if (!this.userAction) {
      this.init();
      this.userAction = true;
    }
    Tone.Transport.start();
  }

  /**
   * Stop the sequencer
   */
  stop(): void {
    Tone.Transport.pause();
    this.resetStep();
  }

  /**
   * Sequencer handler
   */
  private hit(timeSpent: number): void {
    this.step$.next(this.config.currentStep);
    this.updateStep();
  }

  /**
   * Update sequencer's step
   */
  private updateStep(): void {
    if (this.config.currentStep.hit === this.config.hitsPerBar) {
      this.config.currentStep.hit = 1;
      if (this.config.currentStep.bar === this.config.bars) {
        this.config.currentStep.bar = 1;
      } else {
        this.config.currentStep.bar++;
      }
    } else {
      this.config.currentStep.hit++;
    }
  }

  /**
   * Reset sequencer's step
   */
  private resetStep(): void {
    this.config.currentStep = {
      hit: 1,
      bar: 1,
    };
  }
}
