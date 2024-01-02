import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch
} from "solid-js";
import {
  listShortcutSections,
  sendShortcutSectionItemUsage,
  ShortcutItem,
  ShortcutItemTargetType,
  ShortcutSection,
  ShortcutSectionItemUsage
} from "../../../lib/http-interface";
import { SquareRender } from "../../../lib/squarified-treemap";
import { SectionIcon } from "../bookmark/section-icon";
import { BreakpointsContext, DocumentStatusContext } from "../../../lib/contextes";
import { notUAN } from "@siaikin/utils";

import "./shortcut-grid.scss";
import { SectionItem, SectionItemSizeType } from "../bookmark/section-item";
import { INTERACTIVE_INTERVAL } from "../../../lib/utils/interactive_interval";
import { Icon } from "@iconify-icon/solid";

type ShortcutTreeNode = {
  usages: Array<Pick<ShortcutSectionItemUsage, "clickCount">>;
};
type ShortcutTreeNodeMap = {
  Section: Omit<ShortcutSection, "items"> & {
    type: "section";
    items: Array<ShortcutTreeNodeMap[keyof ShortcutTreeNodeMap]>;
  };
  SectionItem: ShortcutItem & { type: "item" | "rest" } & ShortcutTreeNode;
};

export default function ShortcutGrid() {
  const [, { largerThan }] = BreakpointsContext.useContext();
  const [visibleStatus] = DocumentStatusContext.useContext();

  const [sectionInfo] = createResource(async () => {
    const sections = await listShortcutSections();

    const sectionMap = new Map<number, ShortcutTreeNodeMap["Section"]>();

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const { items } = section;

      // 补全没有使用过的 item
      items.forEach(
        (item) =>
          (item.usages ?? []).length <= 0 &&
          (item.usages = [{ clickCount: 1 } as ShortcutSectionItemUsage])
      );

      const sectionNode: ShortcutTreeNodeMap["Section"] = {
        type: "section",
        ...section,
        items: items.map(
          (item) => ({ ...item, type: "item" }) as ShortcutTreeNodeMap["SectionItem"]
        )
      };
      sectionMap.set(sectionNode.id, sectionNode);
    }

    return {
      defaultSection: sectionMap.get(sections[0].id),
      sectionMap
    };
  });

  const [currentSection, setCurrentSection] = createSignal<ShortcutTreeNodeMap["Section"]>();
  createEffect(() => sectionInfo() && setCurrentSection(sectionInfo()?.defaultSection));
  const currentSectionTreemapData = createMemo(() => {
    const _currentSection = currentSection();
    return { ..._currentSection } as ShortcutTreeNodeMap["Section"];
  });

  const usageMap = new Map<string, ShortcutSectionItemUsage>();
  function handleFavoriteClick(item: ShortcutTreeNodeMap[keyof ShortcutTreeNodeMap]) {
    switch (item.type) {
      case "item":
        {
          switch (item.target) {
            case ShortcutItemTargetType.SelfTab:
              window.open(item.url, "_self", "noopener,noreferrer");
              break;
            case ShortcutItemTargetType.NewTab:
              window.open(item.url, "_blank", "noopener,noreferrer");
              break;
            case ShortcutItemTargetType.Embed:
            default:
              break;
          }
          const _currentSection = currentSection();
          if (!_currentSection) return;
          const joinedId = `${_currentSection.id}-${item.id}`;
          if (!notUAN(usageMap.get(joinedId))) {
            usageMap.set(joinedId, {
              sectionId: _currentSection.id,
              itemId: item.id,
              clickCount: 0
            });
          }
          usageMap.get(joinedId)!.clickCount++;
        }
        break;
      case "section":
        setCurrentSection(item);
        break;
      case "rest":
        setViewMode("list");
        break;
      default:
        break;
    }
  }

  /**
   * 页面可见状态发生变化时发送统计数据.
   */
  createEffect(() => {
    if (visibleStatus() || usageMap.size <= 0) return;

    sendShortcutSectionItemUsage(Array.from(usageMap.values()));
    usageMap.clear();
  });

  const [viewMode, setViewMode] = createSignal<"treemap" | "list">("treemap");

  const [searchValue, setSearchValue] = createSignal("");

  return (
    <div class="cds--aspect-ratio cds--aspect-ratio--1x1 w-full">
      <div class="w-full h-full absolute flex flex-col">
        <cds-tabs
          value={currentSection()?.id}
          on:cds-tabs-selected={(event: CustomEvent) => {
            const current = sectionInfo()?.sectionMap.get(event.detail.item.value);
            if (!current) return;

            setCurrentSection(current);
          }}
        >
          <For each={Array.from(sectionInfo()?.sectionMap.values() ?? [])}>
            {(section) => (
              <>
                <cds-tab id={`section-tab-${section.id}`} value={section.id}>
                  {section.name}
                </cds-tab>
              </>
            )}
          </For>
        </cds-tabs>

        <Switch>
          <Match when={viewMode() === "treemap"}>
            <SquareRender<ShortcutTreeNodeMap[keyof ShortcutTreeNodeMap]>
              gap={2}
              root={currentSectionTreemapData()!}
              rootChildren={(item) => (item.type === "section" ? item.items : [])}
              weight={(item) => (item.type === "section" ? 0 : item.usages[0].clickCount)}
              rest={(weight, sum, restChildren) =>
                ({
                  type: "rest",
                  title: `${restChildren.length}`,
                  usages: [{ clickCount: Math.max(Math.floor(sum / 16), 1) }]
                }) as ShortcutTreeNodeMap["SectionItem"]
              }
              class="flex-auto overflow-hidden"
            >
              {(item) => (
                <cds-clickable-tile
                  class="square-shortcut-item"
                  onClick={() => handleFavoriteClick(item)}
                >
                  {() => {
                    switch (item.type) {
                      case "item":
                        return (
                          <div class="square-shortcut-item__content" title={item.title}>
                            <SectionIcon class="content__icon" item={item as ShortcutItem} />

                            <Show when={largerThan("md")}>
                              <div class="content__title w-full px-1">
                                <span class="inline-block w-full truncate" title={item.title}>
                                  {item.title}
                                </span>
                              </div>
                            </Show>
                          </div>
                        );
                      case "rest":
                        return (
                          <div class="square-shortcut-item__content">
                            <span>
                              + <strong>{item.title}</strong> Items
                            </span>
                          </div>
                        );
                      case "section":
                        return (
                          <div class="square-shortcut-item__content">
                            <Show when={largerThan("md")}>
                              <div class="content__folder-marker flex justify-between">
                                <SectionIcon class="" iconifyIcon={{ icon: "carbon:folder" }} />

                                <cds-tag type="gray" size="sm" class="flex-grow-0 flex-shrink-0">
                                  {`${item.items.length} ${
                                    item.items.length === 1 ? "item" : "items"
                                  }`}
                                </cds-tag>
                              </div>
                            </Show>

                            <span class="content__title w-full px-1">
                              <cds-tooltip class="inline-block w-full" align="bottom">
                                <span class="inline-block w-full truncate font-bold ">
                                  {item.name}
                                </span>
                                <cds-tooltip-content>{item.name}</cds-tooltip-content>
                              </cds-tooltip>
                            </span>
                          </div>
                        );
                    }
                  }}
                </cds-clickable-tile>
              )}
            </SquareRender>
          </Match>
          <Match when={viewMode() === "list"}>
            <div class="flex-auto overflow-auto">
              <Show when={currentSection()} keyed>
                <div class="flex sticky top-0 z-10">
                  <cds-button size="md" on:click={() => setViewMode("treemap")}>
                    <Icon slot="icon" icon="carbon:arrow-left" />
                  </cds-button>
                  <cds-search
                    ref={(el: HTMLElement) =>
                      setTimeout(() => el?.focus(), INTERACTIVE_INTERVAL.INSTANT)
                    }
                    close-button-label-text="Clear search input"
                    label-text="Search"
                    placeholder="Find your bookmark"
                    size="md"
                    value={searchValue()}
                    on:cds-search-input={(event: CustomEvent) => setSearchValue(event.detail.value)}
                  />
                </div>
              </Show>
              <For
                each={currentSection()?.items.filter(
                  (item) =>
                    item.type === "item" &&
                    item.title.toLowerCase().includes(searchValue().toLowerCase())
                )}
              >
                {(item) => (
                  <SectionItem
                    class="mb-0.5"
                    item={item as ShortcutItem}
                    size={SectionItemSizeType.SMALL}
                  />
                )}
              </For>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
