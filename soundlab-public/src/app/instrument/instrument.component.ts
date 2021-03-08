import { Component, Input, OnInit } from '@angular/core';
import { InstrumentConfig, InstrumentPart } from '../classes/Interfaces';
import { interval, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Unsubscriber } from '../classes/Unsubscriber';
import {
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
export class InstrumentComponent extends Unsubscriber implements OnInit {
  @Input() configUrl: string | undefined;

  config$ = new Observable<InstrumentConfig>();

  stopAnimation$ = new Subject<void>();

  constructor(private httpClient: HttpClient) {
    super();
  }

  ngOnInit(): void {
    if (!this.configUrl) throw new Error('No config found for instrument');

    this.config$ = this.loadConfig(this.configUrl);
  }

  /**
   * Load config and convert it to a InstrumentConfig typed object
   * @param configUrl
   * @private
   */
  private loadConfig(configUrl: string): Observable<InstrumentConfig> {
    return this.httpClient.get(configUrl as string).pipe(
      map((instrumentConfig) =>
        this.getInstrumentConfigWithPrefixedUrl(
          configUrl,
          instrumentConfig as InstrumentConfig
        )
      ),
      take(1)
    );
  }

  /**
   * Modifies the given instrument config to add path prefix to all available urls
   * @param instrumentConfigUrl
   * @param instrumentConfig
   * @private
   */
  private getInstrumentConfigWithPrefixedUrl(
    instrumentConfigUrl: string,
    instrumentConfig: InstrumentConfig
  ): InstrumentConfig {
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
   * @param toConvert
   * @param base
   */
  convertPixelToPercentage(toConvert: number, base: number): string {
    return (toConvert * 100) / base + '%';
  }

  trigger(id: string): void {
    const element = document.getElementById(id);
    this.instrumentPartForId$(id)
      .pipe(
        tap(() => this.stopAnimation$.next()),
        switchMap((instrumentPart) =>
          this.animation$(element as HTMLElement, instrumentPart)
        )
      )
      .subscribe();
  }

  private instrumentPartForId$(id: string): Observable<InstrumentPart> {
    return this.config$.pipe(
      map(
        (instrumentConfig) =>
          instrumentConfig.parts.find(
            (part) => part.id === id
          ) as InstrumentPart
      )
    );
  }

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
      ),
      takeUntil(this.stopAnimation$)
    );
  }
}
