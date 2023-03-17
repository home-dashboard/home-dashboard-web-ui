import { readable, writable } from "svelte/store";
import { realtimeStatObservable } from "../http-interface/server-send-event";
import type {
  FormattedSystemCpuStat,
  FormattedSystemDiskStat,
  FormattedSystemMemoryStat,
  FormattedSystemNetStat,
  FormattedSystemRealtimeStat,
  gopsutil_disk_PartitionStat,
  gopsutil_disk_UsageStat,
  SystemNetworkInterfaceStat,
  gopsutil_mem_SwapMemoryStat,
  gopsutil_mem_VirtualMemoryStat,
} from "../http-interface/server-send-event";
import { buffer, concatMap, concatMapTo, from, of, Subject, tap, timer } from "rxjs";
import { visibleStatusStore } from "./document-status-store";
import { notUAN } from "@siaikin/utils";

export class ChartRealtimeStat {
  cpu: FormattedSystemCpuStat = {
    name: "",
    logicalCounts: 0,
    physicalCounts: 0,
    perPercents: [],
    percent: 0,
  };

  memory: FormattedSystemMemoryStat = {
    virtualMemory: { used: 0, available: 0 } as gopsutil_mem_VirtualMemoryStat,
    swapMemory: {} as gopsutil_mem_SwapMemoryStat,
  };

  network: {
    perAdapter: Map<
      number,
      {
        interfaceInfo: SystemNetworkInterfaceStat;
        ioStatList: Array<{ receiveRate: number; sentRate: number; timestamp: number }>;
      }
    >;
    all: Array<{ receiveRate: number; sentRate: number; timestamp: number }>;
    countLimit: number;
  } = {
    perAdapter: new Map<
      number,
      {
        interfaceInfo: SystemNetworkInterfaceStat;
        ioStatList: Array<{ receiveRate: number; sentRate: number; timestamp: number }>;
      }
    >(),
    all: [],
    countLimit: 30,
  };

  disk: {
    perDisk: Map<
      string,
      {
        partition: gopsutil_disk_PartitionStat;
        usage: gopsutil_disk_UsageStat;
        ioStatList: Array<{ writeRate: number; readRate: number; timestamp: number }>;
      }
    >;
    countLimit: number;
  } = {
    perDisk: new Map<
      string,
      {
        partition: gopsutil_disk_PartitionStat;
        usage: gopsutil_disk_UsageStat;
        ioStatList: Array<{ writeRate: number; readRate: number; timestamp: number }>;
      }
    >(),
    countLimit: 15,
  };

  protected updateCpuStat(cpu: FormattedSystemCpuStat) {
    this.cpu = { ...cpu };
  }

  protected updateMemoryStat(memory: FormattedSystemMemoryStat) {
    this.memory = { ...memory };
  }

  protected updateNetworkStat(networkStatList: Array<FormattedSystemNetStat>, timestamp: number) {
    const { perAdapter, all, countLimit } = this.network;

    const allStat = {
      receiveRate: 0,
      sentRate: 0,
      timestamp,
    };

    for (let i = networkStatList.length; i--; ) {
      const { interfaceStat, ioStat } = networkStatList[i];

      if (!perAdapter.has(interfaceStat.index)) {
        perAdapter.set(interfaceStat.index, { interfaceInfo: interfaceStat, ioStatList: [] });
      }

      const adapterInfo = perAdapter.get(interfaceStat.index);
      if (!notUAN(adapterInfo)) continue;

      allStat.receiveRate += ioStat.receiveRate;
      allStat.sentRate += ioStat.sentRate;

      adapterInfo.ioStatList.push({ ...ioStat, timestamp });
      if (adapterInfo.ioStatList.length > countLimit) adapterInfo.ioStatList.shift();
    }

    all.push(allStat);
    if (all.length > countLimit) all.shift();

    this.network = {
      perAdapter,
      all,
      countLimit,
    };
  }

  protected updateDiskStat(diskStatList: Array<FormattedSystemDiskStat>, timestamp: number) {
    const { perDisk, countLimit } = this.disk;

    for (let i = diskStatList.length; i--; ) {
      const { partitionStat, usageStat, ioStat } = diskStatList[i];

      if (!perDisk.has(partitionStat.device)) {
        perDisk.set(partitionStat.device, {
          partition: partitionStat,
          usage: usageStat,
          ioStatList: [],
        });
      }

      const diskInfo = perDisk.get(partitionStat.device);
      if (!notUAN(diskInfo)) continue;

      diskInfo.ioStatList.push({ ...ioStat, timestamp });
      if (diskInfo.ioStatList.length > countLimit) diskInfo.ioStatList.shift();
    }

    this.disk = {
      perDisk,
      countLimit,
    };
  }

  update({ cpu, memory, network, disk, timestamp }: FormattedSystemRealtimeStat) {
    this.updateCpuStat(cpu);
    this.updateMemoryStat(memory);
    this.updateNetworkStat(network, timestamp);
    this.updateDiskStat(disk, timestamp);
  }
}

const chartRealtimeStat = new ChartRealtimeStat();

export const store = readable<ChartRealtimeStat>(chartRealtimeStat, (set) => {
  const tapSubject = new Subject();

  let focusStatus = false;
  focusStatusStore.subscribe((status) => (focusStatus = status));
  let visibleStatus = false;
  visibleStatusStore.subscribe((status) => (visibleStatus = status));

  const subscription = realtimeStatObservable
    .pipe(
      tap(() => {
        if (focusStatus || !visibleStatus) return;

        tapSubject.next(undefined);
      }),
      buffer(tapSubject),
      concatMap((statList) => {
        if (statList.length === 1) return of(statList[0]);

        const decreasedList = statList.length > 30 ? statList.slice(-30) : statList;

        /**
         * 同时接收到多个统计信息时, 使每个统计信息之间间隔 250ms 以避免大量数据计算导致页面卡顿.
         */
        return from(decreasedList).pipe(concatMapTo(timer(250), (value) => value));
      })
    )
    .subscribe((stat) => {
      chartRealtimeStat.update(stat);
      set(chartRealtimeStat);
    });

  return () => subscription.unsubscribe();
});

export const focusStatusStore = writable(false);
