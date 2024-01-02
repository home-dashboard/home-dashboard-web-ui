export type Bookmark = {
  name: string;
  url: string;
};

export type BookmarkFolder = {
  name: string;
  bookmarks: Bookmark[];
};

export async function bookmarkParser(blob: Blob): Promise<Array<BookmarkFolder>> {
  const result: Array<BookmarkFolder> = [];

  const domGenerator = document.createElement("template");
  domGenerator.innerHTML = `<div>${await blob.text()}}</div>`;
  const offscreenContainer = document.createDocumentFragment();
  offscreenContainer.append(domGenerator.content);

  const folderNameElements = offscreenContainer.querySelectorAll("h1, h3");
  for (let i = 0; i < folderNameElements.length; i++) {
    const folderEl = folderNameElements.item(i);

    const bookmarks = folderEl.parentNode?.querySelectorAll(":scope > dl > dt > a");
    if (!bookmarks || bookmarks.length <= 0) continue;

    const folder: BookmarkFolder = { name: folderEl.textContent ?? "", bookmarks: [] };
    for (let j = 0; j < bookmarks.length; j++) {
      const bm = bookmarks.item(j);

      folder.bookmarks.push({
        name: bm.textContent ?? "",
        url: bm.getAttribute("href") ?? ""
      });
    }

    result.push(folder);
  }

  return result;
}
