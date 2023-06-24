import dateFnsFormatDuration from "date-fns/formatDuration";
import addSeconds from "date-fns/addSeconds";
import intervalToDuration from "date-fns/intervalToDuration";
import { typeIsNumber } from "@siaikin/utils";

/**
 * 格式化时间间隔, 例如: 1年2个月3周4天5小时6分钟7秒.
 * @param seconds 秒数
 * @param options
 */
export function formatDuration(
  seconds: number,
  options: Parameters<typeof dateFnsFormatDuration>[1] = {}
): string {
  const duration = intervalToDuration({
    start: new Date(),
    end: addSeconds(new Date(), seconds),
  });

  return dateFnsFormatDuration(duration, options);
}

const units = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"] as const;
export type Units = (typeof units)[number];
/**
 * 获取持续时间的最大单位.
 */
export function getDurationMaxUnit(seconds: number): Units {
  const duration = intervalToDuration({
    start: new Date(),
    end: addSeconds(new Date(), seconds),
  });

  for (let i = 0; i < units.length; i++) {
    const unit = duration[units[i]];
    if (typeIsNumber(unit) && unit > 0) {
      return units[i];
    }
  }

  return "seconds";
}

/**
 * 获取持续时间指定单位的值.
 */
export function getDurationUnitValue(seconds: number, unit: Units): number {
  const duration = intervalToDuration({
    start: new Date(),
    end: addSeconds(new Date(), seconds),
  });

  return duration[unit] ?? 0;
}
