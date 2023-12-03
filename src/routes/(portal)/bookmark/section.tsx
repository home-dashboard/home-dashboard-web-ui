import {
  createMemo,
  createSignal,
  For,
  JSX,
  mergeProps,
  Show,
  splitProps,
  VoidProps
} from "solid-js";
import { deleteShortcutSection, ShortcutItem, ShortcutSection } from "../../../lib/http-interface";
import { Icon } from "@iconify-icon/solid";
import { SectionItem } from "./section-item";
import { createStore } from "solid-js/store";
import { HDLoadingButton } from "../../../lib/components/button";

import "./section.scss";
import { SectionItemModal } from "./section-item-modal";
import { SectionIcon } from "./section-icon";
import { ReactiveMap } from "@solid-primitives/map";
import { getCDSInputValue, handleCDSInput } from "../../../lib/utils/felte-utils";

export function Section(
  props: VoidProps<
    {
      size?: "sm" | "md" | "lg";
      section: ShortcutSection;
      onRemove?: () => Promise<void> | void;
      onEdit?: () => Promise<void> | void;
      onRemoveItems?: (items: Array<number>, permanently: boolean) => Promise<void> | void;
      onCreateItem?: (data: ShortcutItem) => Promise<void> | void;
    } & JSX.HTMLAttributes<HTMLDivElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, [
    "section",
    "size",
    "onRemove",
    "onEdit",
    "onRemoveItems",
    "onCreateItem"
  ]);
  const mergedProps = mergeProps({ size: "md" }, localProps);

  const section = createMemo(() => mergedProps.section);

  const editStoreInitialValue = () => ({
    editing: false,
    selectedMap: new ReactiveMap<number, ShortcutItem>()
  });
  const [editStore, setEditStore] = createStore(editStoreInitialValue());

  const sectionItemDeleteStoreInitialValue = () => ({
    opened: false,
    permanently: false
  });
  const [sectionItemDeleteStore, setSectionItemDeleteStore] = createStore(
    sectionItemDeleteStoreInitialValue()
  );
  async function handleDeleteItems() {
    await mergedProps?.onRemoveItems?.(
      Array.from(editStore.selectedMap.keys()),
      sectionItemDeleteStore.permanently
    );
    setSectionItemDeleteStore(sectionItemDeleteStoreInitialValue());
    setEditStore(editStoreInitialValue());
  }

  const [sectionItemModalOpened, setSectionItemModalOpened] = createSignal(false);

  return (
    <>
      <cds-expandable-tile with-interactive={true} {...otherProps} class="overflow-visible">
        <div slot="above-the-fold-content">
          <div class="section__title flex items-center justify-between flex-wrap">
            <span>{section().name}</span>
            <span class="flex-auto" />
            <HDLoadingButton
              class="ml-auto"
              size="sm"
              kind="ghost"
              onClick={() => setSectionItemModalOpened(true)}
            >
              <Icon slot="icon" width={16} height={16} icon="carbon:bookmark-add" />
              Add bookmark
            </HDLoadingButton>
            <cds-overflow-menu class="flex-none self-end">
              <Icon slot="icon" icon="carbon:overflow-menu-vertical" />
              <span slot="tooltip-content">More options</span>

              <cds-overflow-menu-body>
                <cds-overflow-menu-item onClick={() => mergedProps.onEdit?.()}>
                  Edit
                </cds-overflow-menu-item>
                <cds-overflow-menu-item
                  divider={true}
                  danger={true}
                  onClick={() => mergedProps.onRemove?.()}
                >
                  Delete
                </cds-overflow-menu-item>
              </cds-overflow-menu-body>
            </cds-overflow-menu>
          </div>
          <div class="flex items-center mr-2 mb-2">
            <p class="favorite-section__preview-items flex-auto truncate">
              <For each={section().items}>{(item) => <SectionIcon item={item} class="mr-2" />}</For>
            </p>
            <cds-tag type="gray" class="flex-grow-0 flex-shrink-0">
              {`${section().items.length} ${section().items.length === 1 ? "item" : "items"}`}
            </cds-tag>
          </div>
        </div>
        {/* cds-expandable-tile 内部仅在初始化时计算并设置 cds-tile-below-the-fold-content 高度. 这导致元素增加时高度会溢出. 因此写死高度 h-96 并 overflow-auto */}
        <cds-tile-below-the-fold-content class="flex flex-col h-96 overflow-auto relative mb-8">
          <div
            class="flex justify-end items-center sticky top-0 z-10 mb-2"
            style={{ "background-color": "var(--cds-layer)" }}
          >
            <Show
              when={editStore.editing}
              fallback={
                <cds-button
                  size="sm"
                  kind="danger--ghost"
                  onClick={() => setEditStore({ editing: true })}
                >
                  <Icon slot="icon" width={16} height={16} icon="carbon:trash-can" />
                  Choose and remove
                </cds-button>
              }
            >
              <cds-button
                size="sm"
                kind="ghost"
                onClick={() => setEditStore(editStoreInitialValue())}
              >
                Cancel
              </cds-button>
              <cds-button
                size="sm"
                kind="danger--ghost"
                onClick={() => setSectionItemDeleteStore({ opened: true })}
                disabled={editStore.selectedMap.size <= 0}
              >
                <Icon slot="icon" width={16} height={16} icon="carbon:trash-can" />
                Remove
              </cds-button>
            </Show>
          </div>
          <div class="section__items box-border cds--css-grid cds--css-grid--full-width cds--css-grid--narrow">
            <For each={section().items}>
              {(item) => (
                <div class="cds--css-grid-column cds--sm:col-span-4 cds--max:col-span-4">
                  <SectionItem
                    onSelected={(selected) =>
                      selected
                        ? editStore.selectedMap.set(item.id, item)
                        : editStore.selectedMap.delete(item.id)
                    }
                    item={item}
                    type={editStore.editing ? "selectable" : undefined}
                  />
                </div>
              )}
            </For>
          </div>
        </cds-tile-below-the-fold-content>
      </cds-expandable-tile>

      <SectionItemModal
        section={section()}
        open={sectionItemModalOpened()}
        onConform={(data) => mergedProps?.onCreateItem?.(data)}
        onClose={() => setSectionItemModalOpened(false)}
      />

      <cds-modal open={sectionItemDeleteStore.opened}>
        <cds-modal-header>
          <cds-modal-heading>
            Confirm remove selected <strong>{editStore.selectedMap.size} items</strong> from folder{" "}
            <strong>{section().name}</strong> ?
          </cds-modal-heading>
        </cds-modal-header>

        <cds-modal-body>
          <cds-modal-body-content>
            <cds-checkbox
              label-text="Delete permanently"
              checked={sectionItemDeleteStore.permanently}
              on:cds-checkbox-changed={(event: CustomEvent) =>
                setSectionItemDeleteStore({ permanently: getCDSInputValue(event) as boolean })
              }
            />
            Deleting items permanently will remove them from your all bookmarks.
          </cds-modal-body-content>
        </cds-modal-body>

        <cds-modal-footer>
          <cds-modal-footer-button
            kind="secondary"
            data-modal-primary-focus=""
            onClick={() => setSectionItemDeleteStore(sectionItemDeleteStoreInitialValue())}
          >
            Cancel
          </cds-modal-footer-button>
          <HDLoadingButton
            kind="danger"
            loadingProps={{ description: "Deleting" }}
            onLoadingClick={handleDeleteItems}
          >
            Confirm
          </HDLoadingButton>
        </cds-modal-footer>
      </cds-modal>
    </>
  );
}
