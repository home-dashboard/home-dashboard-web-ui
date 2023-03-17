export interface FormattedSystemRealtimeStat {
  cpu: FormattedSystemCpuStat;
  memory: FormattedSystemMemoryStat;
  network: Array<FormattedSystemNetStat>;
  disk: Array<FormattedSystemDiskStat>;
  timestamp: number;
}

export type FormattedSystemMemoryStat = SystemMemoryStat;

export interface FormattedSystemCpuStat {
  name: string;
  logicalCounts: number;
  physicalCounts: number;
  perPercents: Array<number>;
  percent: number;
}

export interface FormattedSystemNetStat {
  interfaceStat: SystemNetworkInterfaceStat;
  ioStat: {
    receiveRate: number;
    sentRate: number;
  };
}

export interface FormattedSystemDiskStat {
  partitionStat: gopsutil_disk_PartitionStat;
  usageStat: gopsutil_disk_UsageStat;
  ioStat: {
    writeRate: number;
    readRate: number;
  };
}

export interface SystemRealtimeStat {
  memory: SystemMemoryStat;
  network: Array<SystemNetworkStat>;
  disk: Array<SystemDiskStat>;
  cpu: Record<string, SystemCpuStat>;
  host: SystemHostStat;
  timestamp: number;
}

export interface SystemNetworkStat {
  interfaceStat: SystemNetworkInterfaceStat;
  ioStat: gopsutil_net_IOCountersStat;
}

export interface SystemNetworkInterfaceStat extends gopsutil_net_InterfaceStat {
  type: number;
  description: string;
}

export interface SystemMemoryStat {
  virtualMemory: gopsutil_mem_VirtualMemoryStat;
  swapMemory: gopsutil_mem_SwapMemoryStat;
}

export interface SystemDiskStat {
  partitionStat: gopsutil_disk_PartitionStat;
  UsageStat: gopsutil_disk_UsageStat;
  ioStat: gopsutil_disk_IOCountersStat;
}

export interface SystemCpuStat {
  infoStat: gopsutilInfoStat;
  physicalCounts: number;
  logicalCounts: number;
  percent: number;
  perPercents: Array<number>;
}

export interface SystemHostStat {
  hostname: string;
  uptime: number;
  bootTime: number;
  procs: number; // number of processes
  os: string; // ex: freebsd, linux
  platform: string; // ex: ubuntu, linuxmnumber
  platformFamily: string; // ex: debian, rhel
  platformVersion: string; // version of the complete OS
  kernelVersion: string; // version of the OS kernel (if available)
  kernelArch: string; // native cpu architecture queried at runtime, as returned by `uname -m` or empty string in case of error
  virtualizationSystem: string;
  virtualizationRole: string; // guest or host
  hostId: string; // ex: uuid
}

export type gopsutilInfoStat = {
  cpu: number;
  vendorId: string;
  family: string;
  model: string;
  stepping: number;
  physicalId: string;
  coreId: string;
  cores: number;
  modelName: string;
  mhz: number;
  cacheSize: number;
  flags: Array<string>;
  microcode: string;
};

export type gopsutil_disk_PartitionStat = {
  device: string;
  mountponumber: string;
  fstype: string;
  opts: Array<string>;
};

export type gopsutil_disk_UsageStat = {
  path: string;
  fstype: string;
  total: number;
  free: number;
  used: number;
  usedPercent: number;
  inodesTotal: number;
  inodesUsed: number;
  inodesFree: number;
  inodesUsedPercent: number;
};

export type gopsutil_disk_IOCountersStat = {
  readCount: number;
  mergedReadCount: number;
  writeCount: number;
  mergedWriteCount: number;
  readBytes: number;
  writeBytes: number;
  readTime: number;
  writeTime: number;
  iopsInProgress: number;
  ioTime: number;
  weightedIO: number;
  name: string;
  serialNumber: string;
  label: string;
};

export type gopsutil_mem_VirtualMemoryStat = {
  // Total amount of RAM on this system
  total: number;

  // RAM available for programs to allocate
  //
  // This value is computed from the kernel specific values.
  available: number;

  // RAM used by programs
  //
  // This value is computed from the kernel specific values.
  used: number;

  // Percentage of RAM used by programs
  //
  // This value is computed from the kernel specific values.
  usedPercent: number;

  // This is the kernel's notion of free memory; RAM chips whose bits nobody
  // cares about the value of right now. For a human consumable number,
  // Available is what you really want.
  free: number;

  // OS X / BSD specific numbers:
  // http://www.macyourself.com/2010/02/17/what-is-free-wired-active-and-inactive-system-memory-ram/
  active: number;
  inactive: number;
  wired: number;

  // FreeBSD specific numbers:
  // https://reviews.freebsd.org/D8467
  laundry: number;

  // Linux specific numbers
  // https://www.centos.org/docs/5/html/5.1/Deployment_Guide/s2-proc-meminfo.html
  // https://www.kernel.org/doc/Documentation/filesystems/proc.txt
  // https://www.kernel.org/doc/Documentation/vm/overcommit-accounting
  buffers: number;
  cached: number;
  writeBack: number;
  dirty: number;
  writeBackTmp: number;
  shared: number;
  slab: number;
  sreclaimable: number;
  sunreclaim: number;
  pageTables: number;
  swapCached: number;
  commitLimit: number;
  committedAS: number;
  highTotal: number;
  highFree: number;
  lowTotal: number;
  lowFree: number;
  swapTotal: number;
  swapFree: number;
  mapped: number;
  vmallocTotal: number;
  vmallocUsed: number;
  vmallocChunk: number;
  hugePagesTotal: number;
  hugePagesFree: number;
  hugePagesRsvd: number;
  hugePagesSurp: number;
  hugePageSize: number;
};

export type gopsutil_mem_SwapMemoryStat = {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  sin: number;
  sout: number;
  pgIn: number;
  pgOut: number;
  pgFault: number;

  // Linux specific numbers
  // https://www.kernel.org/doc/Documentation/cgroup-v2.txt
  pgMajFault: number;
};

export type gopsutil_net_InterfaceAddr = {
  addr: string;
};

export type gopsutil_net_InterfaceStat = {
  index: number;
  mtu: number; // maximum transmission unit
  name: string; // e.g., "en0", "lo0", "eth0.100"
  hardwareAddr: string; // IEEE MAC-48, EUI-48 and EUI-64 form
  flags: Array<string>; // e.g., FlagUp, FlagLoopback, FlagMulticast
  addrs: Array<gopsutil_net_InterfaceAddr>;
};

export type gopsutil_net_IOCountersStat = {
  name: string; // interface name
  bytesSent: number; // number of bytes sent
  bytesRecv: number; // number of bytes received
  packetsSent: number; // number of packets sent
  packetsRecv: number; // number of packets received
  errin: number; // total number of errors while receiving
  errout: number; // total number of errors while sending
  dropin: number; // total number of incoming packets which were dropped
  dropout: number; // total number of outgoing packets which were dropped (always 0 on OSX and BSD)
  fifoin: number; // total number of FIFO buffers errors while receiving
  fifoout: number; // total number of FIFO buffers errors while sending
};

export interface FormattedProcessRealtimeStat extends ProcessRealtimeStat {
  processes: Array<FormattedProcessStat>;
}

export type FormattedProcessStat = ProcessStat;

export interface ProcessRealtimeStat {
  processes: Array<ProcessStat>;
  sortField: string;
  sortOrder: boolean;
  max: number;
  total: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface ProcessStat {
  pid: number;
  name: string;
  username: string;
  cpuPercent: number;
  memoryPercent: number;
  ThreadSize: number;
  createTime: number;
}
