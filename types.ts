export interface ImageData {
  base64: string;
  mimeType: string;
  url: string; // for display purposes
}

export enum ProcessingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedResult {
  imageUrl?: string;
  text?: string;
}
