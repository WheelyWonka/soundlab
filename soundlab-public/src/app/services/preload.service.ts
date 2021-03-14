import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Instrument, InstrumentPart } from '../classes/Interfaces';
import { BehaviorSubject, Observable, zip } from 'rxjs';
import { getInstrumentConfigPath } from '../shared/Helpers';
declare const createjs: any;

@Injectable({
  providedIn: 'root',
})
export class PreloadService {
  readonly progress = new BehaviorSubject(0);
  private queue = new createjs.LoadQueue(true);

  constructor(private httpClient: HttpClient) {
    this.queue.on(
      'progress',
      (event: ProgressEvent) => this.progress.next(event.loaded),
      this
    );
    /**
     * 🚀 Launch preloading !
     */
    this.buildManifest()
      .pipe(tap((manifest) => this.queue.loadManifest(manifest)))
      .subscribe();
  }

  /**
   * Observable that returns the array of all links to preload.
   */
  private buildManifest(): Observable<string[]> {
    const instrumentConfigsUrls = environment.instrumentConfigs;

    return zip(
      ...instrumentConfigsUrls.map((url) =>
        this.httpClient.get(url).pipe(
          // Get all links from the given instrument config.
          map((instrumentConfig) =>
            this.flattenUrlsFromInstrumentConfig(
              url,
              instrumentConfig as Instrument
            )
          )
        )
      )
    ).pipe(
      map((urlsArray) => {
        // Be sure that there are no duplicated links.
        const flatArray = urlsArray.reduce((acc, val) => acc.concat(val), []);
        const set = new Set(flatArray);
        return Array.from(set);
      })
    );
  }

  /**
   * Get all inks from a given instrument config
   */
  private flattenUrlsFromInstrumentConfig(
    instrumentConfigUrl: string,
    instrumentConfig: Instrument
  ): string[] {
    const uniqueUrlsSet = new Set([
      instrumentConfig.background.url,
      ...instrumentConfig.parts.map((part) => part.animation.url),
      ...instrumentConfig.parts.reduce(
        (acc: string[], part: InstrumentPart) =>
          acc.concat(...part.notes.map((note) => note.url)),
        []
      ),
    ]);
    const pathPrefix = getInstrumentConfigPath(instrumentConfigUrl);
    const uniqueUrlsPrefixed = Array.from(uniqueUrlsSet).map(
      (url) => `/${pathPrefix}${url}`
    );
    return uniqueUrlsPrefixed;
  }
}
