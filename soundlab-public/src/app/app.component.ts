import { Component } from '@angular/core';
import { PreloadService } from './services/preload.service';
import { fromEvent } from 'rxjs';
import { map, pluck, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  preloadProgress$ = this.preloadService.progress;

  browserHeight$ = fromEvent(window, 'resize').pipe(
    map((event) => event.target as Window),
    map((window) => window.innerHeight + 'px'),
    startWith(window.innerHeight + 'px')
  );

  constructor(private preloadService: PreloadService) {}
}
