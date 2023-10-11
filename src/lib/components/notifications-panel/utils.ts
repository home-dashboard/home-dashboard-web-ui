/**
 * 舍入毫秒为单位的时间间隔.
 *
 * 例: 1000ms -> 1s, 10000ms -> 10s, 100000ms -> 1m, 1000000ms -> 16m
 * @param duration 毫秒为单位的时间间隔, 可以为负数.
 */
export function roundDuration(duration: number): {
  value: number;
  unit: Intl.RelativeTimeFormatUnitSingular;
} {
  const isNegative = duration < 0;
  duration = Math.abs(duration);

  const msPerSecond = 1000;
  const msPerMinute = 60 * msPerSecond;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const result: {
    value: number;
    unit: Intl.RelativeTimeFormatUnitSingular;
  } = { value: 0, unit: "second" };

  if (duration < msPerMinute) {
    result.value = Math.round(duration / msPerSecond);
    result.unit = "second";
  } else if (duration < msPerHour) {
    result.value = Math.round(duration / msPerMinute);
    result.unit = "minute";
  } else if (duration < msPerDay) {
    result.value = Math.round(duration / msPerHour);
    result.unit = "hour";
  } else if (duration < msPerMonth) {
    result.value = Math.round(duration / msPerDay);
    result.unit = "day";
  } else if (duration < msPerYear) {
    result.value = Math.round(duration / msPerMonth);
    result.unit = "month";
  } else {
    result.value = Math.round(duration / msPerYear);
    result.unit = "year";
  }

  // 负数
  result.value *= isNegative ? -1 : 1;

  return result;
}

export function roundDurationToString(duration: number): string {
  const { value, unit } = roundDuration(duration);
  return formatDuration(value, unit);
}

const relativeFormatter = new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" });
function formatDuration(duration: number, unit: Intl.RelativeTimeFormatUnitSingular): string {
  return relativeFormatter.format(duration, unit);
}
