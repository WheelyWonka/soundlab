import { Component, OnInit } from '@angular/core';
import * as Tone from 'tone';
import { SequencerService } from '../services/sequencer.service';
import { Observable } from 'rxjs';
import { NotesMatrix } from '../classes/Interfaces';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.less'],
})
export class SequencerComponent implements OnInit {
  readonly instruments$ = this.sequencerService.instrument$;

  notesAmount = 8;
  tempo = 120;
  step = 0;

  // notes = this.instruments$.pipe(
  //   map(instruments => {
  //     return {
  //       [instrument.id] =
  //     }
  //   })
  // )

  constructor(private sequencerService: SequencerService) {
    Tone.Transport.bpm.value = this.tempo;
    Tone.Transport.scheduleRepeat(
      this.repeat.bind(this),
      `${this.notesAmount}n`
    );
  }

  ngOnInit(): void {}

  buildNotesMatrix(): void {}

  private repeat(timeSpent: number): void {
    console.log(this.step % this.notesAmount);
    this.step++;
  }

  notesArray(n: number): any[] {
    return Array(n);
  }

  resumeSequencer(): void {
    Tone.Transport.start();
  }

  pauseSequencer(): void {
    Tone.Transport.pause();
  }

  changeTempo(): void {
    Tone.Transport.bpm.value = this.tempo;
  }
}
