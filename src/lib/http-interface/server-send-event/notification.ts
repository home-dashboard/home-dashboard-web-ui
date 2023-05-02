import { Subject } from "rxjs";
import { BASE_URL } from "../../../global-config";
import { notUAN } from "@siaikin/utils";
import type {
  SystemDiskStat,
  SystemNetworkStat,
  SystemCpuStat,
  SystemMemoryStat,
  SystemRealtimeStat,
  FormattedSystemCpuStat,
  FormattedSystemDiskStat,
  FormattedSystemNetStat,
  FormattedSystemRealtimeStat,
  FormattedProcessRealtimeStat,
  ProcessRealtimeStat,
  UserNotificationMessage,
} from "./notification-types";

function formatRealtimeCpuStat(cpuStatMap: Record<string, SystemCpuStat>): FormattedSystemCpuStat {
  const cpuStat = cpuStatMap[0] || {};
  const infoStat = cpuStat.infoStat || {};

  return {
    name: infoStat.modelName,
    logicalCounts: cpuStat?.logicalCounts,
    physicalCounts: cpuStat?.physicalCounts,
    perPercents: cpuStat?.perPercents,
    percent: cpuStat?.percent,
  };
}

function formatRealtimeMemoryStat(memStat: SystemMemoryStat): SystemMemoryStat {
  return memStat;
}

/**
 *
 * @param networkStat
 * @param prevNetworkStat
 * @param duration unit: ms
 * @return {*}
 */
function formatRealtimeNetworkStat(
  networkStat: Array<SystemNetworkStat>,
  prevNetworkStat: Array<SystemNetworkStat>,
  duration: number
): Array<FormattedSystemNetStat> {
  const result = [];

  const adapterMap = new Map();
  for (let i = networkStat.length; i--; ) {
    const item = networkStat[i];
    adapterMap.set(item.interfaceStat.index, item);
  }

  for (let i = prevNetworkStat.length; i--; ) {
    const prevItem = prevNetworkStat[i];
    const item = adapterMap.get(prevItem.interfaceStat.index);

    if (!notUAN(item)) continue;

    const { ioStat } = item;
    const prevIoStat = prevItem.ioStat;

    result.push({
      interfaceStat: item.interfaceStat,
      ioStat: {
        receiveRate: Math.floor(((ioStat.bytesRecv - prevIoStat.bytesRecv) / duration) * 1e3),
        sentRate: Math.floor(((ioStat.bytesSent - prevIoStat.bytesSent) / duration) * 1e3),
      },
    });
  }

  return result;
}

function formatRealtimeDiskStat(
  diskStat: Array<SystemDiskStat>,
  prevDiskStat: Array<SystemDiskStat>,
  duration: number
): Array<FormattedSystemDiskStat> {
  const result = [];

  const diskMap = new Map();
  for (let i = diskStat.length; i--; ) {
    const item = diskStat[i];
    diskMap.set(item.partitionStat.device, item);
  }

  for (let i = prevDiskStat.length; i--; ) {
    const prevItem = prevDiskStat[i];
    const item = diskMap.get(prevItem.partitionStat.device);

    if (!notUAN(item)) continue;

    const { ioStat } = item;
    const prevIoStat = prevItem.ioStat;

    result.push({
      partitionStat: item.partitionStat,
      usageStat: item.usageStat,
      ioStat: {
        writeRate: Math.floor(((ioStat.writeBytes - prevIoStat.writeBytes) / duration) * 1e3),
        readRate: Math.floor(((ioStat.readBytes - prevIoStat.readBytes) / duration) * 1e3),
      },
    });
  }

  return result;
}

/**
 * 重新组织实时统计信息的数据格式, 以便于图表展示.
 *
 * @param realtimeStat
 *
 * @param prevRealtimeStat
 */
function formatRealtimeStat(
  realtimeStat: SystemRealtimeStat,
  prevRealtimeStat: SystemRealtimeStat
): FormattedSystemRealtimeStat {
  const { cpu, memory, network, disk } = realtimeStat;
  const duration = realtimeStat.timestamp - prevRealtimeStat.timestamp;

  return {
    cpu: formatRealtimeCpuStat(cpu),
    memory: formatRealtimeMemoryStat(memory),
    network: formatRealtimeNetworkStat(network, prevRealtimeStat.network, duration),
    disk: formatRealtimeDiskStat(disk, prevRealtimeStat.disk, duration),
    timestamp: Math.floor((realtimeStat.timestamp + prevRealtimeStat.timestamp) / 2),
  };
}

function formatProcessRealtimeStat(stat: ProcessRealtimeStat): FormattedProcessRealtimeStat {
  const { processes } = stat;
  const sameNameProcess: Record<string, number> = {};

  for (let i = 0; i < processes.length; i++) {
    const { name } = processes[i];

    if (sameNameProcess[name]) processes[i].name = `${name}(${sameNameProcess[name]++})`;
    else sameNameProcess[name] = 1;
  }

  return stat;
}

function initialNotification() {
  const realtimeStatSubject = new Subject<FormattedSystemRealtimeStat>();
  const processRealtimeStatSubject = new Subject<FormattedProcessRealtimeStat>();
  const userNotificationSubject = new Subject<UserNotificationMessage>();

  let prevStat: { realtimeStat: SystemRealtimeStat };
  let sse: EventSource;

  function createNotificationEventSource() {
    if (notUAN(sse)) sse.close();

    sse = new EventSource(`${BASE_URL}/notification`, { withCredentials: true });

    sse.addEventListener("realtimeStat", (ev) => {
      const stat = JSON.parse(ev.data) as { realtimeStat: SystemRealtimeStat };

      if (notUAN(prevStat)) {
        realtimeStatSubject.next(formatRealtimeStat(stat.realtimeStat, prevStat.realtimeStat));
      }

      prevStat = stat;
    });

    sse.addEventListener("processRealtimeStat", (ev) => {
      const stat = JSON.parse(ev.data) as ProcessRealtimeStat;

      processRealtimeStatSubject.next(formatProcessRealtimeStat(stat));
    });

    sse.addEventListener("userNotification", (ev) => {
      userNotificationSubject.next(JSON.parse(ev.data));
    });
  }

  return {
    realtimeStatObservable: realtimeStatSubject.asObservable(),
    processRealtimeStatObservable: processRealtimeStatSubject.asObservable(),
    userNotificationObservable: userNotificationSubject.asObservable(),
    refreshEventSource: createNotificationEventSource,
  };
}

export const {
  realtimeStatObservable,
  processRealtimeStatObservable,
  userNotificationObservable,
  refreshEventSource,
} = initialNotification();
