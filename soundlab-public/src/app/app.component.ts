import { Component } from '@angular/core';
import { PreloadService } from './services/preload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  preloadProgress$ = this.preloadService.progress;

  constructor(private preloadService: PreloadService) {}
}
