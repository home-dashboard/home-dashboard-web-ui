import { httpClient } from "../http-client";

export function upgrade(params: { fetcherName: string; version: string }) {
  return httpClient.post({ url: "upgrade", body: params });
}

export function version() {
  return httpClient.get<VersionInfo>({ url: "version" });
}

export interface VersionInfo {
  version: string;
  commit: string;
  date: number;
}
