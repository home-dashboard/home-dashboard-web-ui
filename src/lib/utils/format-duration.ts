import dateFnsFormatDuration from "date-fns/formatDuration";
import addSeconds from "date-fns/addSeconds";
import intervalToDuration from "date-fns/intervalToDuration";

/**
 * 格式化时间间隔, 例如: 1年2个月3周4天5小时6分钟7秒.
 * @param seconds 秒数
 */
export function formatDuration(seconds: number): string {
  const duration = intervalToDuration({
    start: new Date(),
    end: addSeconds(new Date(), seconds),
  });

  return dateFnsFormatDuration(duration, {
    format: ["years", "months", "weeks", "days", "hours", "minutes", "seconds"],
    // locale: zhCN,
  });
}
