import { createEffect, createResource, For, on, Suspense } from "solid-js";
import {
  createShortcutSection,
  deleteShortcutItem,
  deleteShortcutSection,
  deleteShortcutSectionItems,
  listShortcutSections,
  refreshCachedShortcutItemImageIcon,
  ShortcutItem,
  ShortcutSection,
  updateShortcutSection
} from "../../../lib/http-interface";
import { Section } from "./section";

import "./styles.scss";
import { Icon } from "@iconify-icon/solid";
import { HDLoadingButton } from "../../../lib/components/button";
import { createStore, reconcile } from "solid-js/store";
import { SectionModal } from "./section-modal";
import { typeIsArray } from "@siaikin/utils";
import { BookmarkImportModal } from "./bookmark-import-modal";

export default function Index() {
  const [sectionStore, setSectionStore] = createStore({ sections: [] as Array<ShortcutSection> });

  const [sections, { refetch: refetchSections }] = createResource(() => listShortcutSections());
  createEffect(
    on(
      sections,
      (data) => typeIsArray(data) && setSectionStore(reconcile({ sections: data }, { key: "id" }))
    )
  );

  async function handleSectionRefreshImageIconCache(section: ShortcutSection) {
    await refreshCachedShortcutItemImageIcon(section.id);
    await refetchSections();
  }

  async function handleItemsDelete(
    section: ShortcutSection,
    itemIds: Array<number>,
    permanently: boolean
  ) {
    if (permanently) {
      await deleteShortcutItem(itemIds);
    } else {
      await deleteShortcutSectionItems(section.id, itemIds);
    }

    await refetchSections();
  }

  async function handleItemCreate(section: ShortcutSection, item: ShortcutItem): Promise<void> {
    await updateShortcutSection({
      ...section,
      items: [item]
    });
    await refetchSections();
  }

  const [sectionCreateStore, setSectionCreateStore] = createStore({
    opened: false,
    type: "create" as "create" | "edit",
    section: {} as ShortcutSection
  });
  async function handleCreateSection(section: ShortcutSection) {
    switch (sectionCreateStore.type) {
      case "create":
        await createShortcutSection(section);
        break;
      case "edit":
        await updateShortcutSection(section);
        break;
    }

    setSectionCreateStore({ opened: false });
    await refetchSections();
  }

  const [sectionDeleteStore, setSectionDeleteStore] = createStore({
    opened: false,
    section: {} as ShortcutSection
  });
  async function handleDeleteSection() {
    await deleteShortcutSection(sectionDeleteStore.section.id);
    setSectionDeleteStore({ opened: false });
    await refetchSections();
  }

  const [sectionImportStore, setSectionImportStore] = createStore({
    opened: false
  });
  async function handleImportComplete() {
    setSectionImportStore({ opened: false });
    await refetchSections();
  }

  return (
    <>
      <div class="favorite-container cds--css-grid cds--css-grid--full-width cds--css-grid--narrow">
        <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16">
          <cds-button onClick={() => setSectionImportStore({ opened: true })}>
            <Icon slot="icon" width={16} height={16} icon="carbon:document-import" />
            Import From File
          </cds-button>
          <cds-button
            class="float-right"
            kind="tertiary"
            onClick={() => setSectionCreateStore({ opened: true })}
          >
            <Icon slot="icon" width={16} height={16} icon="carbon:add-large" />
            Add Folder
          </cds-button>
        </div>
        <Suspense>
          <For each={sectionStore.sections}>
            {(section) => (
              <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 ">
                <Section
                  section={section}
                  onRemove={() => setSectionDeleteStore({ opened: true, section })}
                  onEdit={() => setSectionCreateStore({ opened: true, type: "edit", section })}
                  onRefreshItemImageIconCache={() => handleSectionRefreshImageIconCache(section)}
                  onRemoveItems={(ids, permanently) => handleItemsDelete(section, ids, permanently)}
                  onCreateItem={(data) => handleItemCreate(section, data)}
                />
              </div>
            )}
          </For>
        </Suspense>
      </div>

      <SectionModal
        open={sectionCreateStore.opened}
        type={sectionCreateStore.type}
        formData={sectionCreateStore.section}
        onConform={handleCreateSection}
        onClose={() => setSectionCreateStore({ opened: false })}
      />

      <cds-modal open={sectionDeleteStore.opened}>
        <cds-modal-header>
          <cds-modal-heading>
            Confirm delete section <strong>{sectionDeleteStore.section.name}</strong> ?
          </cds-modal-heading>
        </cds-modal-header>

        <cds-modal-body>
          <cds-modal-body-content>
            Are you sure you want to delete this section? This action cannot be undone.
          </cds-modal-body-content>
        </cds-modal-body>

        <cds-modal-footer>
          <cds-modal-footer-button
            kind="secondary"
            data-modal-primary-focus=""
            onClick={() => setSectionDeleteStore({ opened: false })}
          >
            Cancel
          </cds-modal-footer-button>
          <HDLoadingButton kind="danger" onLoadingClick={handleDeleteSection}>
            Confirm delete
          </HDLoadingButton>
        </cds-modal-footer>
      </cds-modal>

      <BookmarkImportModal
        open={sectionImportStore.opened}
        onClose={() => handleImportComplete()}
      />
    </>
  );
}
