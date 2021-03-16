import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Instrument, InstrumentPart } from '../classes/Interfaces';
import { fromEvent, interval, merge, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Unsubscriber } from '../classes/Unsubscriber';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { getInstrumentConfigPath } from '../shared/Helpers';
import { SequencerService } from '../services/sequencer.service';

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.component.html',
  styleUrls: ['./instrument.component.less'],
})
export class InstrumentComponent
  extends Unsubscriber
  implements OnInit, AfterViewInit {
  @Input() configUrl: string | undefined;

  @ViewChild('container', { static: false }) container: ElementRef | undefined;

  instrument$ = new Observable<Instrument>();

  private audios: { [key in string]: HTMLAudioElement } = {};

  /**
   * Capture key down events and stop propagation of them
   */
  private readonly keyDowns$ = fromEvent(document, 'keydown').pipe(
    map((event) => {
      event.preventDefault();
      event.stopPropagation();
      return event;
    })
  );

  /**
   * Capture key up events
   */
  private readonly keyUps$ = fromEvent(document, 'keyup');

  constructor(
    private httpClient: HttpClient,
    private sequencerService: SequencerService
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.configUrl) throw new Error('No config found for instrument');

    // Build instrument with the loaded config
    this.loadConfig(this.configUrl);
  }

  ngAfterViewInit(): void {
    this.initInstrumentParts$().subscribe();
  }

  /**
   * Load config and convert it to a InstrumentConfig typed object
   */
  private loadConfig(configUrl: string): void {
    // Todo: Why http get is trigger twice ??
    this.instrument$ = this.httpClient.get(configUrl as string).pipe(
      map((instrumentConfig) =>
        this.getInstrumentConfigWithPrefixedUrl(
          configUrl,
          instrumentConfig as Instrument
        )
      ),
      tap((instrument) =>
        this.sequencerService.addInstrument$.next(instrument)
      ),
      take(1)
    );
  }

  /**
   * Modifies the given instrument config to add path prefix to all available urls
   */
  private getInstrumentConfigWithPrefixedUrl(
    instrumentConfigUrl: string,
    instrumentConfig: Instrument
  ): Instrument {
    const pathPrefix = `${getInstrumentConfigPath(instrumentConfigUrl)}`;
    instrumentConfig.background.url = `${pathPrefix}${instrumentConfig.background.url}`;
    instrumentConfig.parts.forEach((part) => {
      part.animation.url = `${pathPrefix}${part.animation.url}`;
      part.notes.forEach((note) => {
        note.url = `${pathPrefix}${note.url}`;
      });
    });

    return instrumentConfig;
  }

  /**
   * Convert a given pixel position in % according to its container
   */
  convertPixelToPercentage(toConvert: number, base: number): string {
    return (toConvert * 100) / base + '%';
  }

  /**
   * Register triggers for all parts of the instrument.
   */
  private initInstrumentParts$(): Observable<InstrumentPart[]> {
    return this.instrument$.pipe(
      debounceTime(1),
      map((instrument) =>
        instrument.parts.map((part) => {
          // Add notes to the audios library.
          part.notes.forEach(
            (note) => (this.audios[note.code] = new Audio(note.url))
          );
          this.subscribeToTriggers(instrument, part);
          return part;
        })
      ),
      takeUntil(this.unsubscribe$)
    );
  }

  /**
   * Subscribe to triggers (clicks and keys) for the given instrument part
   * and launch the animation when trigger happens.
   */
  private subscribeToTriggers(
    instrument: Instrument,
    instrumentPart: InstrumentPart
  ): Subscription {
    const element = document.getElementById(instrumentPart.id) as HTMLElement;
    return merge(
      fromEvent(element, 'click'),
      ...instrumentPart.notes.map((note) =>
        merge(this.keyDowns$, this.keyUps$).pipe(
          map((event) => event as KeyboardEvent),
          filter((event) => event.key === note.code),
          distinctUntilChanged(
            (previous, current) => previous.type === current.type
          ),
          filter((event) => event.type === 'keydown')
        )
      )
    )
      .pipe(
        map((event) => event as KeyboardEvent),
        tap((event) => {
          if (event.key) {
            this.playSoundForKey(event.key);
          } else {
            this.playSoundForClick(element);
          }
        }),
        switchMap(() => this.animation$(element, instrument, instrumentPart))
      )
      .subscribe();
  }

  /**
   * Return the animation for the given element and instrument part.
   */
  private animation$(
    element: HTMLElement,
    instrument: Instrument,
    instrumentPart: InstrumentPart
  ): Observable<number> {
    const frameRate = instrumentPart.animation.frameRate;
    const frameAmount = instrumentPart.animation.frameAmount;
    const frameWidth =
      ((this.container as ElementRef).nativeElement.clientWidth *
        instrumentPart.animation.dimensions.width) /
      instrument.dimensions.width;

    return interval(1000 / frameRate).pipe(
      takeWhile((tick) => tick !== frameAmount),
      map((tick) => (tick === frameAmount - 1 ? 0 : tick)),
      tap(
        (tick) =>
          (element.style.backgroundPositionX = -(tick * frameWidth) + 'px')
      )
    );
  }

  /**
   * Play the sound matching the given key.
   */
  private playSoundForKey(key: string): void {
    if (this.audios[key]) {
      this.audios[key].pause();
      this.audios[key].currentTime = 0;
      this.audios[key].play();
    }
  }

  /**
   * One day it will use octave setting to target the right note but for now we
   * will trigger the first sound available for the given element.
   */
  private playSoundForClick(element: HTMLElement): void {
    this.instrument$
      .pipe(
        map((instrument) => instrument.parts),
        map((parts) => parts.find((part) => part.id === element.id)),
        tap((part) => (part ? this.playSoundForKey(part.notes[0].code) : null)),
        take(1)
      )
      .subscribe();
  }
}
