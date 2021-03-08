export interface InstrumentConfig {
  label: string;
  dimensions: Dimensions;
  background: Background;
  parts: InstrumentPart[];
}

export interface InstrumentPart {
  id: string;
  notes: Note[];
  animation: Animation;
}

export interface Background {
  url: string;
  file?: {};
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
  file?: {};
}

export interface Animation {
  url: string;
  file?: {};
  duration: number;
  frameRate: number;
  frameAmount: number;
  dimensions: Dimensions;
  position: Position;
}
