import { Observable } from 'rxjs';

export interface Instrument {
  label: string;
  dimensions: Dimensions;
  background: Background;
  parts: InstrumentPart[];
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
