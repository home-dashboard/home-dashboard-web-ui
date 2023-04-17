import { readable } from "svelte/store";
import type { Readable } from "svelte/store";

export interface DayCell {
  width: number;
  height: number;
  spacingVertical: number;
  spacingHorizontal: number;
}

export interface Day {
  /**
   * 当天的贡献数量
   */
  count: number;
  /**
   * 当天的日期
   */
  date: string;
  /**
   * 当天的贡献等级
   */
  level: ContributionLevel;
}

export enum ContributionLevel {
  NONE,
  FIRST_QUARTILE,
  SECOND_QUARTILE,
  THIRD_QUARTILE,
  FOURTH_QUARTILE,
}

export function generateLevelColorMap(colors: Array<string>): Record<ContributionLevel, string> {
  return {
    [ContributionLevel.NONE]: colors[0],
    [ContributionLevel.FIRST_QUARTILE]: colors[1],
    [ContributionLevel.SECOND_QUARTILE]: colors[2],
    [ContributionLevel.THIRD_QUARTILE]: colors[3],
    [ContributionLevel.FOURTH_QUARTILE]: colors[4],
  };
}

/**
 * 获取月份
 * @param date
 */
export function getMonth(date: string): number {
  return new Date(date).getMonth() + 1;
}

/**
 * 获取星期
 * @param date
 */
export function getWeekDay(date: string): number {
  return new Date(date).getDay() || 7;
}

/**
 * 获取相同月份的单元格数量
 * @param monthList
 * @param start
 */
export function getSameCount(monthList: Array<number>, start: number): number {
  const len = monthList.length;
  const month = monthList[start];

  for (let i = start; i < len; i++) {
    if (monthList[i] !== month) return i - start;
  }

  // 处理 monthList 中的所有月份都相同的情况.
  return len - start;
}

/**
 * 生成本地化后的星期和月份
 * @param intlOptions
 */

export function generateTranslation(intlOptions: {
  locales?: string | string[];
  options?: Intl.DateTimeFormatOptions;
}): {
  weeks: Record<number, string>;
  months: Record<number, string>;
} {
  const formatter = new Intl.DateTimeFormat(intlOptions.locales, {
    weekday: intlOptions.options?.weekday || "short",
    month: intlOptions.options?.month || "short",
    timeZone: "UTC",
  });

  const weeks: Record<number, string> = Array.from<undefined>({ length: 7 }).reduce(
    (weeks, _, i) => {
      const date = new Date(0, 0, i + 1);
      const day = date.getUTCDay();
      weeks[day || 7] =
        formatter.formatToParts(date).find((part) => part.type === "weekday")?.value ||
        "Unknown Weekday";
      return weeks;
    },
    {} as Record<number, string>
  );
  const months: Record<number, string> = Array.from<undefined>({ length: 12 }).reduce(
    (months, _, i) => {
      const date = new Date(0, i);
      months[date.getUTCMonth() + 1] =
        formatter.formatToParts(date).find((part) => part.type === "month")?.value ||
        "Unknown Month";
      return months;
    },
    {} as Record<number, string>
  );

  return { weeks, months };
}

/**
 * 自适应贡献图表的列数.
 * @param tableElement 贡献图表的表格元素
 * @param measuredElement 用于测量的单元格元素
 * @param cell 单元格的尺寸
 * @param maxColumn 最大列数
 */
export function adaptiveColumn(
  tableElement: HTMLTableElement,
  measuredElement: HTMLTableCellElement,
  cell: DayCell,
  maxColumn: number
): Readable<number> {
  return readable<number>(0, (set) => {
    let { width: tableWidth } = tableElement.getBoundingClientRect();
    let { width: labelWidth } = measuredElement.getBoundingClientRect();

    const observer = new ResizeObserver((entries) => {
      for (let i = entries.length; i--; ) {
        const entry = entries[i];

        if (entry.target === tableElement) {
          tableWidth = entry.contentRect.width;
        } else if (entry.target === measuredElement) {
          labelWidth = entry.contentRect.width;
        }
      }

      /**
       * 表格列数计算公式: (表格宽度 - 标签宽度) / (单元格宽度 + 单元格水平间距) + ((表格宽度 - 标签宽度) % (单元格宽度 + 单元格水平间距) >= 单元格宽度 ? 1 : 0)
       */
      const width = tableWidth - labelWidth;
      const columnWidth = cell.width + cell.spacingHorizontal;
      set(
        Math.min(
          Math.floor(width / columnWidth) + (width % columnWidth >= cell.width ? 1 : 0) - 1,
          maxColumn
        )
      );
    });
    observer.observe(tableElement);
    observer.observe(measuredElement);

    return () => {
      observer.disconnect();
    };
  });
}

/**
 * 计算显示在贡献图表中的贡献总数
 * @param days 贡献数据
 * @param startIndex 从第几天的下标开始计算
 */
export function summaryContributionCount(days: Array<Day | undefined>, startIndex: number): number {
  const len = days.length;

  let count = 0;
  for (let i = startIndex; i < len; i++) {
    count += days[i]?.count || 0;
  }

  return count;
}

/**
 * 如果贡献数据开头或结尾不满一周, 则根据 `firstDayOfWeek` 补全.
 * @param days 贡献数据
 * @param firstDayOfWeek 一周的第一天是星期几
 */
export function padWeek(days: Array<Day>, firstDayOfWeek: number): Array<Day | undefined> {
  const len = days.length;
  if (len === 0) return [];

  // 补全开头的空白
  const prefix: Array<Day | undefined> = Array.from({
    length: Math.abs(getWeekDay(days[0].date) - firstDayOfWeek),
  }).map(() => undefined);
  // 补全结尾的空白
  const suffix: Array<Day | undefined> = Array.from({
    length: 7 - (((getWeekDay(days[days.length - 1].date) + 7 - firstDayOfWeek) % 7) + 1),
  }).map(() => undefined);

  return prefix.concat(days, suffix);
}

/**
 * 计算需要被渲染的第一列的下标. 默认情况下将渲染所有列, 但是当表格宽度不足时, 将缩减渲染的列数.
 *
 * 返回值的约束规则如下:
 * 1. 如果能够容纳的列数都是同一个月份的, 返回 0.
 * 2. 如果能够容纳的列数代表的第一个月所占的列数大于等于 4, 返回 0.
 * 3. 以上情况都不满足时, 返回值是能够容纳的列数代表的第二个月的起始列.
 *
 * @param monthList 月份列表
 * @param capacity 表格能够容纳的最大列数
 */
export function calculateRenderedStartColumnIndex(
  monthList: Array<number>,
  capacity: number
): number {
  // 总列数
  const total = monthList.length;

  // 如果表格能够容纳的最大列数大于等于总列数, 则渲染所有列.
  // if (capacity >= total) return 0;

  // 起始列的下标
  const index = total - capacity;
  // 从起始列向后跟起始列月份相同且连续的列数
  const sameCount = getSameCount(monthList, index);

  // 处理约束规则 1
  if (index + sameCount >= total) return 0;

  // 处理约束规则 2
  /**
   * 考虑到起始月份所占列的宽度可能不足以容纳月份标签, 因此只有当占用列宽大于等于 4 时才渲染起始月份, 否则渲染下一个月份.
   */
  if (index === 0) return sameCount >= 4 ? index : index + sameCount;

  // 处理约束规则 3
  if (monthList[index] === monthList[index - 1]) {
    // index 是某个月中某列时, 渲染下一个月的第一列.
    return index + sameCount;
  } else {
    // index 是某个月的起始列时直接返回
    return index;
  }
}
