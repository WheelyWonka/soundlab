import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstrumentComponent } from './instrument/instrument.component';
import { HttpClientModule } from '@angular/common/http';
import { PreloadService } from './services/preload.service';
import { SequencerComponent } from './sequencer/sequencer.component';
import { SequencerService } from './services/sequencer.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, InstrumentComponent, SequencerComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [PreloadService, SequencerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
