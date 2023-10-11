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
  gopsutil_mem_VirtualMemoryStat
} from "../http-interface/server-send-event";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import { notUAN } from "@siaikin/utils";

export class ChartRealtimeStat {
  cpu: FormattedSystemCpuStat = {
    name: "",
    logicalCounts: 0,
    physicalCounts: 0,
    perPercents: [],
    percent: 0
  };

  memory: FormattedSystemMemoryStat = {
    virtualMemory: {
      used: 0,
      available: 0,
      usedPercent: 0,
      free: 0,
      active: 0,
      inactive: 0,
      wired: 0,
      buffers: 0,
      cached: 0,
      shared: 0,
      slab: 0
    } as gopsutil_mem_VirtualMemoryStat,
    swapMemory: {} as gopsutil_mem_SwapMemoryStat
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
    countLimit: 30
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
    countLimit: 15
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
      timestamp
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
      countLimit
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
          ioStatList: []
        });
      }

      const diskInfo = perDisk.get(partitionStat.device);
      if (!notUAN(diskInfo)) continue;

      diskInfo.ioStatList.push({ ...ioStat, timestamp });
      if (diskInfo.ioStatList.length > countLimit) diskInfo.ioStatList.shift();
    }

    this.disk = {
      perDisk,
      countLimit
    };
  }

  update({ cpu, memory, network, disk, timestamp }: FormattedSystemRealtimeStat) {
    this.updateCpuStat(cpu);
    this.updateMemoryStat(memory);
    this.updateNetworkStat(network, timestamp);
    this.updateDiskStat(disk, timestamp);
  }
}

export function observe(
  ...observables: Array<Observable<boolean>>
): [BehaviorSubject<ChartRealtimeStat>, () => void] {
  const subscriptions: Array<Subscription> = [];

  const chartRealtimeStat = new ChartRealtimeStat();

  const subject = new BehaviorSubject<ChartRealtimeStat>(chartRealtimeStat);

  let isBuffer = false;
  subscriptions.push(
    combineLatest(observables).subscribe(
      (statusList) => (isBuffer = !statusList.every((status) => status))
    )
  );

  let statList: Array<FormattedSystemRealtimeStat> = [];
  const subscription = realtimeStatObservable.subscribe((stat) => {
    statList.push(stat);
    if (statList.length > 30) statList.shift();

    if (isBuffer) return;

    for (let i = 0; i < statList.length; i++) {
      chartRealtimeStat.update(statList[i]);
    }
    statList = [];
    subject.next(chartRealtimeStat);
  });
  subscriptions.push(subscription);

  return [subject, () => subscriptions.forEach((subscription) => subscription.unsubscribe())];
}
