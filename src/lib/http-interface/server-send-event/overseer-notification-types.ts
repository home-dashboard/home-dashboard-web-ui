export interface OverseerNewVersionMessage {
  version: string;
  fetcherName: string;
  releaseNotes: string;
  url: string;
}

export enum OverseerStatusType {
  RUNNING = 1,
  UPGRADING,
  RESTARTING,
  DESTROYED
}

export interface OverseerStatusMessage {
  type: OverseerStatusType;
  text: string;
  extra: Record<string, unknown>;
}
