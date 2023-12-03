import { deepMerge, typeIsArray, typeIsObject } from "@siaikin/utils";
import {
  adaptiveColumn,
  calculateRenderedStartColumnIndex,
  Day,
  DayCell,
  generateTranslation,
  getMonth,
  getSameCount,
  padWeek,
  summaryContributionCount
} from "./github-contributions-chart-types";
import {
  createMemo,
  createSignal,
  For,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
  VoidProps
} from "solid-js";
import { elementRect } from "../../../utils/reactive-dom-rect";

import "./github-contributions-chart.scss";

export interface GitHubContributionsChartProps {
  /**
   * 以周为单位的 GitHub 贡献统计信息
   */
  days: Array<Day>;
  /**
   * 一周的第一天是周几, 默认是周日
   */
  firstDayOfWeek: number;
  /**
   * GitHub 贡献统计信息的颜色, 一共有四个等级. 默认使用 GitHub 官方的颜色, 也可以自定义.
   */
  colors: Array<string>;
  /**
   * Intl 参数, 用于格式化日期. 默认使用浏览器的语言和地区.
   */
  intl:
    | {
        locales: string | string[];
        options?: Intl.DateTimeFormatOptions;
      }
    | string
    | string[];
  /**
   * 设置单元格的宽度, 高度, 水平间距, 垂直间距.
   * 默认值: { width: 10, height: 10, spacingVertical: 3, spacingHorizontal: 3 }
   *
   **仅支持 px 单位**
   */
  cell: Partial<DayCell>;
  title: (day: Day) => string;
}

export default function GitHubContributionsChart(
  props: VoidProps<Partial<GitHubContributionsChartProps>>
) {
  const defaultProps: GitHubContributionsChartProps = {
    days: [],
    firstDayOfWeek: 7,
    colors: [],
    intl: {
      locales: (navigator.languages as string[]) || navigator.language,
      options: { dateStyle: "full" }
    },
    cell: { width: 10, height: 10, spacingVertical: 3, spacingHorizontal: 3 },
    title: (day) => {
      const date = new Date(day.date);
      return `${day.count} contribution${day.count > 1 ? "s" : ""} on ${formatter().format(date)}`;
    }
  };

  const [localProps, otherProps] = splitProps(props, [
    "days",
    "firstDayOfWeek",
    "colors",
    "intl",
    "cell",
    "title"
  ]);
  const mergedProps = mergeProps(defaultProps, localProps);

  const colorVariables = createMemo(() => {
    const colors = mergedProps.colors;
    const colorMaxIndex = colors.length - 1;
    if (!typeIsArray(colors) || colors.length <= 0) return {};
    return {
      "--svelte-cell-level-0": colors[Math.min(0, colorMaxIndex)],
      "--svelte-cell-level-1": colors[Math.min(1, colorMaxIndex)],
      "--svelte-cell-level-2": colors[Math.min(2, colorMaxIndex)],
      "--svelte-cell-level-3": colors[Math.min(3, colorMaxIndex)],
      "--svelte-cell-level-4": colors[Math.min(4, colorMaxIndex)]
    };
  });

  const intl = createMemo(() =>
    typeIsObject(mergedProps.intl) ? mergedProps.intl : { locales: mergedProps.intl }
  );
  const formatter = createMemo(() => new Intl.DateTimeFormat(intl().locales, intl().options));
  const translation = createMemo(() => generateTranslation(intl()));

  const cell = createMemo(
    () =>
      deepMerge(
        {
          width: 10,
          height: 10,
          spacingVertical: 3,
          spacingHorizontal: 3
        },
        mergedProps.cell
      ) as DayCell
  );

  /**
   * 根据 `firstDayOfWeek` 的值, 排序一周内每一天的标签.
   */
  const weekList = createMemo(() =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => ((day + mergedProps.firstDayOfWeek - 1) % 7) + 1)
  );

  /**
   * 补全头尾的贡献数据, 使其能够以周为单位排列.
   */
  const paddedDays = createMemo(() => padWeek(mergedProps.days, mergedProps.firstDayOfWeek));

  const maxColumn = createMemo(() => paddedDays().length / 7);

  /**
   * 每一列的月份, 取每一列的第一个单元格的日期作为该列的月份.
   */
  const monthList = createMemo(() =>
    Array.from({ length: maxColumn() }).map((_, index) => {
      index = index * 7;

      let day = paddedDays()[index];
      if (!day) while (day === undefined) day = paddedDays()[++index];

      return getMonth(day.date);
    })
  );

  /**
   * 根据 dom 元素的宽度, 动态计算出一行能够显示多少列.
   */
  const [tableElementRect, setTableElementRect] = createSignal<DOMRectReadOnly>();
  let tableElement: HTMLDivElement | undefined;
  onMount(() => elementRect.watch(tableElement!, setTableElementRect));
  onCleanup(() => elementRect.unwatch(tableElement!));

  const [measuredElementRect, setMeasuredElementRect] = createSignal<DOMRectReadOnly>();
  let measuredElement: HTMLTableCellElement | undefined;
  onMount(() => elementRect.watch(measuredElement!, setMeasuredElementRect));
  onCleanup(() => elementRect.unwatch(measuredElement!));

  const columnCount = createMemo(() => {
    const _tableElementRect = tableElementRect();
    const _measuredElementRect = measuredElementRect();

    return _tableElementRect && _measuredElementRect
      ? adaptiveColumn(_tableElementRect, _measuredElementRect, cell(), maxColumn())
      : 0;
  });
  const startColumnIndex = createMemo(() =>
    calculateRenderedStartColumnIndex(monthList(), columnCount())
  );

  const contributionCountInTable = createMemo(() =>
    summaryContributionCount(paddedDays(), startColumnIndex() * 7)
  );

  return (
    <div class="github-contributions-chart-container" ref={tableElement}>
      <table
        {...otherProps}
        style={{
          "--svelte-cell-width": `${cell().width}px`,
          "--svelte-cell-height": `${cell().height}px`,
          "--svelte-cell-spacing-horizontal": `${cell().spacingHorizontal}px`,
          "--svelte-cell-spacing-vertical": `${cell().spacingVertical}px`,
          ...colorVariables()
        }}
      >
        <caption>
          <strong>{contributionCountInTable()}</strong> contribution
          {contributionCountInTable() > 1 ? "s" : ""} in the table
        </caption>
        <thead>
          <tr>
            <th colspan="1" ref={measuredElement} />
            <For each={monthList().slice(startColumnIndex())}>
              {(month, relativeIndex) => (
                <Show
                  when={
                    relativeIndex() === 0 ||
                    monthList()[startColumnIndex() + relativeIndex() - 1] !== month
                  }
                >
                  <th colspan={getSameCount(monthList(), startColumnIndex() + relativeIndex())}>
                    {translation().months[month]}
                  </th>
                </Show>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={Array.from({ length: 7 }, () => Math.random())}>
            {(_, i) => (
              <tr>
                {/* 设置为 block 并指定高度避免影响表格行高度 */}
                <th style={{ display: "block", height: "var(--svelte-cell-height)" }}>
                  {i() % 2 ? translation().weeks[weekList()[i()]] : ""}
                </th>
                <For each={Array.from({ length: columnCount() }, () => Math.random())}>
                  {(_, j) => {
                    if (i() === 0 && j() === 0) {
                      console.log(startColumnIndex() * 7 + i() + j() * 7);
                    }
                    const day = paddedDays()[startColumnIndex() * 7 + i() + j() * 7];
                    if (day)
                      return (
                        <td
                          data-cell-level={day.level}
                          title={mergedProps.title(day)}
                          data-i={startColumnIndex() * 7 + i() + j() * 7}
                        />
                      );
                    else return <td data-i={startColumnIndex() * 7 + i() + j() * 7} />;
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
