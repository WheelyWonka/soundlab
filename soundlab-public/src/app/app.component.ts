import { Component } from '@angular/core';
import { PreloadService } from './services/preload.service';
import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { getGithubPagesRootFolderPrefix } from './shared/Helpers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  readonly instruments: {
    [key in string]: string;
  } = {
    drumkit: `${getGithubPagesRootFolderPrefix()}/assets/instruments/drumkit/config.json`,
  };

  readonly preloadProgress$ = this.preloadService.progress;

  readonly browserHeight$ = fromEvent(window, 'resize').pipe(
    map((event) => event.target as Window),
    map((window) => window.innerHeight + 'px'),
    startWith(window.innerHeight + 'px')
  );

  constructor(private preloadService: PreloadService) {}
}
