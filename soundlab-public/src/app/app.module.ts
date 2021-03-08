import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstrumentComponent } from './instrument/instrument.component';
import { HttpClientModule } from '@angular/common/http';
import { PreloadService } from './services/preload.service';

@NgModule({
  declarations: [AppComponent, InstrumentComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [PreloadService],
  bootstrap: [AppComponent],
})
export class AppModule {}
