<script lang="ts">
  import { deepMerge, typeIsObject } from "@siaikin/utils";
  import {
    generateTranslation,
    getMonth,
    getSameCount,
    generateLevelColorMap,
    adaptiveColumn,
    summaryContributionCount,
    padWeek,
    calculateRenderedStartColumnIndex,
  } from "./github-contributions-chart-types";
  import type { DayCell } from "./github-contributions-chart-types";
  import type { Day } from "./github-contributions-chart-types";

  /**
   * 以周为单位的 GitHub 贡献统计信息
   */
  export let days: Array<Day> = [];

  /**
   * 一周的第一天是周几, 默认是周日
   */
  export let firstDayOfWeek = 7;

  /**
   * GitHub 贡献统计信息的颜色, 一共有四个等级. 默认使用 GitHub 官方的颜色, 也可以自定义.
   * @see https://docs.github.com/graphql/reference/enums#contributionlevel
   */
  export let colors: [string, string, string, string, string] = [
    "#ebedf0",
    "#9be9a8",
    "#40c463",
    "#30a14e",
    "#216e39",
  ];
  $: levelMapToColor = generateLevelColorMap(colors);

  /**
   * Intl 参数, 用于格式化日期. 默认使用浏览器的语言和地区.
   */
  export let intl:
    | { locales?: string | string[]; options?: Intl.DateTimeFormatOptions }
    | string
    | string[] = {};
  $: _intl = deepMerge(
    _intl || {
      locales: navigator.languages || navigator.language,
      options: { dateStyle: "full" },
    },
    typeIsObject(intl) ? intl : { locales: intl }
  );
  $: formatter = new Intl.DateTimeFormat(_intl.locales, _intl.options);
  $: translation = generateTranslation(_intl);

  /**
   * 设置单元格的宽度, 高度, 水平间距, 垂直间距.
   *
   * 默认值: { width: 10, height: 10, spacingVertical: 3, spacingHorizontal: 3 }
   *
   * **仅支持 px 单位**
   */
  export let cell: Partial<DayCell> = {};
  $: _cell = deepMerge(
    _cell || { width: 10, height: 10, spacingVertical: 3, spacingHorizontal: 3 },
    cell
  );

  export let title: (day: Day) => string = (day) => {
    const date = new Date(day.date);
    return `${day.count} contribution${day.count > 1 ? "s" : ""} on ${formatter.format(date)}`;
  };

  /**
   * 根据 `firstDayOfWeek` 的值, 排序一周内每一天的标签.
   */
  $: weekList = [0, 1, 2, 3, 4, 5, 6].map((day) => ((day + firstDayOfWeek - 1) % 7) + 1);

  /**
   * 补全头尾的贡献数据, 使其能够以周为单位排列.
   */
  $: paddedDays = padWeek(days, firstDayOfWeek);

  /**
   * 每一列的月份, 取每一列的第一个单元格的日期作为该列的月份.
   */
  $: monthList = Array.from({ length: maxColumn }).map((_, index) => {
    index = index * 7;

    let day: Day = paddedDays[index];
    if (!day) while (day === undefined) day = paddedDays[++index];

    return getMonth(day.date);
  });

  /**
   * 根据 dom 元素的宽度, 动态计算出一行能够显示多少列.
   */
  let tableElement: HTMLTableElement;
  let measuredElement: HTMLTableCellElement;
  $: maxColumn = paddedDays.length / 7;
  $: columnCount =
    tableElement &&
    measuredElement &&
    adaptiveColumn(tableElement, measuredElement, _cell, maxColumn);
  $: startColumnIndex = calculateRenderedStartColumnIndex(monthList, $columnCount);

  $: contributionCountInTable = summaryContributionCount(paddedDays, startColumnIndex * 7);
</script>

<div class="container" bind:this="{tableElement}">
  <table
    {...$$restProps}
    style:--svelte-cell-width="{`${_cell.width}px`}"
    style:--svelte-cell-height="{`${_cell.height}px`}"
    style:--svelte-cell-spacing-horizontal="{`${_cell.spacingHorizontal}px`}"
    style:--svelte-cell-spacing-vertical="{`${_cell.spacingVertical}px`}"
    style:--svelte-cell-level-0="{levelMapToColor[0]}"
    style:--svelte-cell-level-1="{levelMapToColor[1]}"
    style:--svelte-cell-level-2="{levelMapToColor[2]}"
    style:--svelte-cell-level-3="{levelMapToColor[3]}"
    style:--svelte-cell-level-4="{levelMapToColor[4]}"
  >
    <caption
      ><strong>{contributionCountInTable}</strong> contribution{contributionCountInTable > 1
        ? "s"
        : ""} in the table
    </caption>
    <thead>
      <tr>
        <th colspan="1" bind:this="{measuredElement}"></th>
        {#each monthList.slice(startColumnIndex) as month, relativeIndex}
          {@const index = startColumnIndex + relativeIndex}
          {#if relativeIndex === 0 || monthList[index - 1] !== month}
            <th colspan="{getSameCount(monthList, index)}">{translation.months[month]}</th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each { length: 7 } as row, i}
        <tr>
          <!-- 设置为 block 并指定高度避免影响表格行高度 -->
          <th style="display: block; height: var(--svelte-cell-height)">
            {i % 2 ? translation.weeks[weekList[i]] : ""}
          </th>
          {#each { length: $columnCount } as _, j}
            {@const day = paddedDays[startColumnIndex * 7 + i + j * 7]}
            {#if day}
              <td data-cell-level="{day.level}" title="{title(day)}"></td>
            {:else}
              <td></td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .container {
    width: 100%;
  }
  table {
    --svelte-cell-height: 10px;
    --svelte-cell-width: 10px;
    --svelte-cell-spacing-horizontal: 3px;
    --svelte-cell-spacing-vertical: 3px;
    --svelte-cell-level-0: #ebedf0;
    --svelte-cell-level-1: #9be9a8;
    --svelte-cell-level-2: #40c463;
    --svelte-cell-level-3: #30a14e;
    --svelte-cell-level-4: #216e39;

    font-size: 12px;
    border-collapse: separate;

    border-spacing: var(--svelte-cell-spacing-horizontal) var(--svelte-cell-spacing-vertical);
  }

  caption {
    text-align: left;

    margin-bottom: 0.5em;
  }

  tr {
    height: var(--svelte-cell-height);
  }

  th {
    position: relative;

    text-align: left;
    white-space: nowrap;
  }

  td {
    width: var(--svelte-cell-width);
  }

  td[data-cell-level="0"] {
    background-color: var(--svelte-cell-level-0);
  }
  td[data-cell-level="1"] {
    background-color: var(--svelte-cell-level-1);
  }
  td[data-cell-level="2"] {
    background-color: var(--svelte-cell-level-2);
  }
  td[data-cell-level="3"] {
    background-color: var(--svelte-cell-level-3);
  }
  td[data-cell-level="4"] {
    background-color: var(--svelte-cell-level-4);
  }
</style>
