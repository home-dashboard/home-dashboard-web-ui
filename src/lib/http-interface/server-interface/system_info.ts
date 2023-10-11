import { httpClient } from "../http-client";

export function systemInfo() {
  return httpClient.get<SystemInfoStat>({ url: "system/info" });
}

/**
 * 系统信息对象.
 * @see https://pkg.go.dev/github.com/shirou/gopsutil/v3@v3.23.10/host#InfoStat
 */
export interface SystemInfoStat {
  hostname: string;
  uptime: number;
  bootTime: number;
  procs: number;
  os: string;
  platform: string;
  platformFamily: string;
  platformVersion: string;
  kernelVersion: string;
  kernelArch: string;
  virtualizationSystem: string;
  virtualizationRole: string;
  hostId: string;
}
