import { createEffect, createResource, createSignal, For, Match, Show, Switch } from "solid-js";
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
import { notUAN, typeIsArray } from "@siaikin/utils";

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
  } & ShortcutTreeNode;
  SectionItem: ShortcutItem & { type: "item" | "rest" } & ShortcutTreeNode;
};

export default function ShortcutGrid() {
  const [, { largerThan }] = BreakpointsContext.useContext();
  const [visibleStatus] = DocumentStatusContext.useContext();

  const [sectionInfo] = createResource(async () => {
    const sections = await listShortcutSections();
    const defaultSectionIndex = sections.findIndex((section) => section.default);
    const defaultSection = sections[defaultSectionIndex];

    const result: ShortcutTreeNodeMap["Section"] = {
      type: "section",
      ...defaultSection,
      items: [],
      usages: [{ clickCount: 1 }]
    };
    const sectionMap = new Map<number, ShortcutTreeNodeMap["Section"]>([[result.id, result]]);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const { items, id } = section;

      for (let j = items.length; j--; ) {
        const item = items[j];
        if (typeIsArray(item.usages) && item.usages.length > 0) continue;

        item.usages = [{ clickCount: 1 } as ShortcutSectionItemUsage];
      }

      if (id === defaultSection.id) {
        result.items = result.items.concat(
          items.map((item) => ({ ...item, type: "item" }) as ShortcutTreeNodeMap["SectionItem"])
        );
      } else {
        const sectionNode: ShortcutTreeNodeMap["Section"] = {
          type: "section",
          ...section,
          items: items.map(
            (item) => ({ ...item, type: "item" }) as ShortcutTreeNodeMap["SectionItem"]
          ),
          usages: [
            {
              clickCount: items.reduce((pre, cur) => pre + cur.usages[0].clickCount, 0)
            }
          ]
        };
        result.items.push(sectionNode);
        sectionMap.set(sectionNode.id, sectionNode);
      }
    }

    return {
      rootSection: result,
      sectionMap
    };
  });

  const [currentSection, setCurrentSection] = createSignal<ShortcutTreeNodeMap["Section"]>();
  createEffect(() => sectionInfo() && setCurrentSection(sectionInfo()?.rootSection));

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
            <SquareRender
              gap={"1px"}
              each={currentSection()?.items}
              weight={(item) => item.usages[0].clickCount}
              rest={(weight, restChildren) =>
                ({
                  type: "rest",
                  title: `${restChildren.length}`,
                  usages: [{ clickCount: weight }]
                }) as ShortcutTreeNodeMap["SectionItem"]
              }
              class="flex-auto"
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
                          <div class="square-shortcut-item__content">
                            <SectionIcon class="content__icon" item={item as ShortcutItem} />

                            <Show when={largerThan("md")}>
                              <div class="content__title w-full px-1">
                                <cds-tooltip class="inline-block w-full" align="bottom">
                                  <span class="inline-block w-full truncate">{item.title}</span>
                                  <cds-tooltip-content>{item.title}</cds-tooltip-content>
                                </cds-tooltip>
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
                  <cds-button kind="secondary" size="md" on:click={() => setViewMode("treemap")}>
                    <Icon slot="icon" icon="carbon:arrow-left" />
                  </cds-button>
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
