import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Instrument, InstrumentPart } from '../classes/Interfaces';
import {
  fromEvent,
  interval,
  merge,
  Observable,
  Subject,
  Subscription,
  timer,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Unsubscriber } from '../classes/Unsubscriber';
import {
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

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.component.html',
  styleUrls: ['./instrument.component.less'],
})
export class InstrumentComponent
  extends Unsubscriber
  implements OnInit, AfterViewInit {
  @Input() configUrl: string | undefined;

  instrument$ = new Observable<Instrument>();

  private readonly keyDowns$ = fromEvent(document, 'keydown').pipe(
    map((event) => {
      event.preventDefault();
      event.stopPropagation();
      return event;
    })
  );
  private readonly keyUps$ = fromEvent(document, 'keyup');

  constructor(private httpClient: HttpClient) {
    super();
  }

  ngOnInit(): void {
    if (!this.configUrl) throw new Error('No config found for instrument');

    // Build instrument with the loaded config
    this.instrument$ = this.loadConfig(this.configUrl);
  }

  ngAfterViewInit(): void {
    this.triggers$().subscribe();
  }

  /**
   * Load config and convert it to a InstrumentConfig typed object
   */
  private loadConfig(configUrl: string): Observable<Instrument> {
    return this.httpClient.get(configUrl as string).pipe(
      map((instrumentConfig) =>
        this.getInstrumentConfigWithPrefixedUrl(
          configUrl,
          instrumentConfig as Instrument
        )
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
    const pathPrefix = getInstrumentConfigPath(instrumentConfigUrl);
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
  private triggers$(): Observable<Subscription[]> {
    return this.instrument$.pipe(
      map((instrument) =>
        instrument.parts.map((part) => this.subscribeToTriggers(part))
      )
    );
  }

  /**
   * Subscribe to triggers (clicks and keys) for the given instrument part
   * and launch the animation when trigger happens.
   */
  private subscribeToTriggers(instrumentPart: InstrumentPart): Subscription {
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
      .pipe(switchMap(() => this.animation$(element, instrumentPart)))
      .subscribe();
  }

  /**
   * Return the animation for the given element and instrument part.
   */
  private animation$(
    element: HTMLElement,
    instrumentPart: InstrumentPart
  ): Observable<number> {
    const frameRate = instrumentPart.animation.frameRate;
    const frameAmount = instrumentPart.animation.frameAmount;
    const frameWidth = element.clientWidth;

    return interval(1000 / frameRate).pipe(
      takeWhile((tick) => tick !== frameAmount),
      tap(
        (tick) =>
          (element.style.backgroundPositionX = -(tick * frameWidth) + 'px')
      )
    );
  }
}
