import { Observable } from 'rxjs';

export interface Instrument {
  id: string;
  label: string;
  dimensions: Dimensions;
  background: Background;
  parts: InstrumentPart[];
  partsObj: {
    [instrumentId in string]: InstrumentPart;
  };
}

export interface InstrumentPart {
  id: string;
  notes: Note[];
  animation: AnimationConfig;
}

export interface Background {
  url: string;
  dimensions: Dimensions;
  position: Position;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Note {
  code: string;
  url: string;
}

export interface AnimationConfig {
  url: string;
  duration: number;
  frameRate: number;
  frameAmount: number;
  dimensions: Dimensions;
  position: Position;
}
export interface SequencerConfig {
  hitsPerBar: number;
  bars: number;
  tempo: number;
  currentStep: Step;
}

export interface Step {
  hit: number;
  bar: number;
}

export type PadsIndex = {
  [instrumentId in string]: {
    [instrumentPartId in string]: {
      [bar in number]: {
        [hit in number]: boolean;
      };
    };
  };
};
