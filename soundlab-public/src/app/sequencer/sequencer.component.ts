import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SequencerService } from '../services/sequencer.service';
import { Unsubscriber } from '../classes/Unsubscriber';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Step } from '../classes/Interfaces';

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.less'],
})
export class SequencerComponent extends Unsubscriber implements OnInit {
  readonly instruments$ = this.sequencerService.instrument$;

  readonly sequencerStep$: Observable<Step> = this.sequencerService.step$.pipe(
    tap(() => this.cdr.detectChanges())
  );

  constructor(
    public sequencerService: SequencerService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {}

  numberArray(n: number): any[] {
    return Array(n);
  }
}
