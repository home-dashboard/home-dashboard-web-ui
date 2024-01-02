import { createSignal, For, mergeProps, Show, splitProps, VoidProps } from "solid-js";
import { Bookmark, BookmarkFolder, bookmarkParser } from "../../../lib/utils/bookmark-parser";
import {
  createShortcutSection,
  extractShortcutItemInfoFromURL,
  listShortcutSections,
  ShortcutItem,
  ShortcutItemTargetType,
  ShortcutSection
} from "../../../lib/http-interface";
import { createStore, reconcile } from "solid-js/store";
import { notUAN } from "@siaikin/utils";
import { Icon } from "@iconify-icon/solid";

export function BookmarkImportModal(
  props: VoidProps<{
    type?: "create" | "update";
    open: boolean;
    onClose: () => void;
  }>
) {
  const [localProps] = splitProps(props, ["type", "open", "onClose"]);
  const mergedProps = mergeProps({ type: "import" }, localProps);

  const [bookmarkInfo, setBookmarkInfo] = createSignal<Array<BookmarkFolder>>([]);

  const [extractBookmarkStatus, setExtractBookmarkStatus] = createStore<Record<string, string>>({});
  const [loadingInfoStore, setLoadingInfoStore] = createStore<
    Partial<{
      currentFolder: BookmarkFolder;
      currentBookmark: Bookmark;
      total: number;
      extracted: number;
    }>
  >({});
  async function handleImport() {
    const _bookmarkInfo = bookmarkInfo();

    for (let i = 0; i < _bookmarkInfo.length; i++) {
      const folder = _bookmarkInfo[i];

      setLoadingInfoStore({ currentFolder: folder, extracted: 0, total: folder.bookmarks.length });

      const items: Array<ShortcutItem> = [];
      for (let j = 0; j < folder.bookmarks.length; j++) {
        const bookmark = folder.bookmarks[j];

        const tempId = `${i}-${j}`;
        try {
          setExtractBookmarkStatus({ [tempId]: "active" });
          setLoadingInfoStore({ currentBookmark: bookmark });
          document
            .querySelector(`[data-bookmark-id="${tempId}"]`)
            ?.scrollIntoView({ block: "center" });

          const { item } = await extractShortcutItemInfoFromURL(bookmark.url, { retry: false });
          items.push(item);

          setExtractBookmarkStatus({ [tempId]: "finished" });
        } catch (e) {
          setExtractBookmarkStatus({ [tempId]: "error" });
          // 提取失败时, 仍然将书签导入
          items.push({
            title: bookmark.name,
            url: bookmark.url,
            target: ShortcutItemTargetType.NewTab
          } as ShortcutItem);
        } finally {
          setLoadingInfoStore({ extracted: j + 1 });
        }
      }

      /**
       * 当存在同名的文件夹时，自动在文件夹名后面加上数字，以示区分
       */
      const nameMatcher = new RegExp(`^${folder.name}(\\((\\d+)\\))?$`);
      const sections = (await listShortcutSections()).filter((section) =>
        nameMatcher.test(section.name)
      );
      const latestSectionNO =
        sections.length > 0
          ? Number.parseInt(sections.sort().pop()?.name.match(nameMatcher)?.[2] ?? "0") + 1
          : 0;
      await createShortcutSection({
        name: latestSectionNO > 0 ? `${folder.name}(${latestSectionNO})` : folder.name,
        items: items
      } as ShortcutSection);
    }

    handleModalClose();
  }

  function handleModalClose() {
    mergedProps.onClose();
    setExtractBookmarkStatus(reconcile({}));
    setBookmarkInfo([]);
    setLoadingInfoStore(reconcile({}));
  }

  return (
    <cds-modal
      prevent-close-on-click-outside={true}
      open={mergedProps.open}
      on:cds-modal-closed={handleModalClose}
    >
      <cds-modal-header>
        <cds-modal-heading>Import bookmark</cds-modal-heading>
      </cds-modal-header>

      <cds-modal-body style={{ "padding-top": "0" }}>
        <Show
          when={notUAN(loadingInfoStore.currentFolder)}
          fallback={
            <cds-file-uploader
              label-description="Only .html files are allowed."
              label-title="Import from file"
              class="block sticky z-10 top-0 backdrop-blur-md p-2"
            >
              <div slot="label-description">
                Only support <code>.html</code> file exported from Chrome or Firefox.
                <br />
                Chrome: settings `{">"}` bookmarks `{">"}` bookmark manager `{">"}` more `{">"}`
                export
                <br />
                Firefox: bookmarks `{">"}` show all bookmarks `{">"}` import and backup `{">"}`
                export
              </div>
              <cds-file-uploader-drop-container
                accept=".html"
                on:cds-file-uploader-drop-container-changed={async (ev: CustomEvent) =>
                  setBookmarkInfo(await bookmarkParser(ev.detail.addedFiles[0] as File))
                }
              >
                Drag and drop files here or click to upload
              </cds-file-uploader-drop-container>
            </cds-file-uploader>
          }
        >
          <div class="w-fit p-4 sticky z-10 top-0 backdrop-blur-md">
            <cds-inline-notification
              title="Please DO NOT close this window until the import is finished."
              subtitle="The progress bar below may help alleviate anxiety."
              kind="warning"
              low-contrast={true}
            />
            <cds-progress-bar
              class="block pt-2 pb-2"
              label={`Extracting folder ${loadingInfoStore.currentFolder?.name}...`}
              helper-text={`${loadingInfoStore.extracted} / ${loadingInfoStore.total}: Parse bookmark => ${loadingInfoStore.currentBookmark?.name}`}
              max={100}
              status="active"
              size="sm"
              value={
                loadingInfoStore.extracted! < 1
                  ? undefined
                  : Math.floor((loadingInfoStore.extracted! / loadingInfoStore.total!) * 100)
              }
            />
          </div>
        </Show>

        <div class="pl-6">
          <cds-ordered-list class="block relative" is-expressive={true}>
            <For each={bookmarkInfo()}>
              {(folder, folderIndex) => (
                <cds-list-item>
                  <Show
                    when={!!folder.name}
                    fallback={<span class="text-gray-500">Untitled </span>}
                  >
                    <span>{folder.name}</span>
                  </Show>
                  <cds-ordered-list slot="nested">
                    <For each={folder.bookmarks}>
                      {(bookmark, bookmarkIndex) => {
                        const id = `${folderIndex()}-${bookmarkIndex()}`;
                        const href = bookmark.url;
                        return (
                          <cds-list-item attr:data-bookmark-id={id}>
                            <div class="flex justify-between">
                              <div class="w-0 flex-auto">
                                <Show
                                  when={!!bookmark.name}
                                  fallback={
                                    <div class="text-amber-500">
                                      <Icon inline={true} icon="carbon:warning-filled" />
                                      Untitled
                                    </div>
                                  }
                                >
                                  <div class="truncate">{bookmark.name}</div>
                                </Show>

                                <a class="inline-block w-full truncate" href={href} target="_blank">
                                  {bookmark.url}
                                </a>
                              </div>
                              <cds-inline-loading
                                class="w-fit"
                                status={extractBookmarkStatus[id]}
                              />
                            </div>
                          </cds-list-item>
                        );
                      }}
                    </For>
                  </cds-ordered-list>
                </cds-list-item>
              )}
            </For>
          </cds-ordered-list>
        </div>
      </cds-modal-body>

      <Show when={!notUAN(loadingInfoStore.currentFolder)}>
        <cds-modal-footer>
          <cds-modal-footer-button
            kind="primary"
            onClick={() => handleImport()}
            disabled={bookmarkInfo().length <= 0}
          >
            Import
          </cds-modal-footer-button>
        </cds-modal-footer>
      </Show>
    </cds-modal>
  );
}
