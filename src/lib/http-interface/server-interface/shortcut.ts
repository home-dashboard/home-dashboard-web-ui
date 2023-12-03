import { httpClient } from "../http-client";
import { Model } from "./common";

export async function createShortcutSection(section: ShortcutSection): Promise<number> {
  return httpClient.post({ url: "shortcut/section/create", body: section });
}

export async function listShortcutSections(): Promise<ShortcutSection[]> {
  const { sections } = await httpClient.get<{ sections: ShortcutSection[] }>({
    url: "shortcut/section/list"
  });
  return sections;
}

export async function updateShortcutSection(section: ShortcutSection): Promise<void> {
  return httpClient.put({ url: `shortcut/section/update/${section.id}`, body: section });
}

export async function deleteShortcutSection(id: number): Promise<void> {
  return httpClient.delete({ url: `shortcut/section/delete/${id}` });
}

export async function deleteShortcutSectionItems(
  id: number,
  itemIds: Array<number>
): Promise<void> {
  return httpClient.delete({
    url: `shortcut/section/delete/${id}/items`,
    queryParams: { itemIds }
  });
}

export async function extractShortcutItemInfoFromURL(
  url: string
): Promise<{ alternatives: Array<ShortcutItem>; item: ShortcutItem }> {
  return httpClient.get({
    url: "shortcut/item/extract-from-url",
    queryParams: { url }
  });
}

export async function createShortcutItem(item: ShortcutItem): Promise<number> {
  return httpClient.post({ url: "shortcut/item/create", body: item });
}

export async function listShortcutItems(sectionId: number): Promise<ShortcutItem[]> {
  return httpClient.get({ url: "shortcut/item/list", queryParams: { sectionId } });
}

export async function updateShortcutItem(item: ShortcutItem): Promise<void> {
  return httpClient.put({ url: `shortcut/item/update/${item.id}`, body: item });
}

export async function deleteShortcutItem(ids: Array<number>): Promise<void> {
  return httpClient.delete({ url: "shortcut/item/delete", queryParams: { ids } });
}

export async function refreshShortcutIcons(): Promise<void> {
  return httpClient.get({ url: "shortcut/icon/refresh" });
}

export function sendShortcutSectionItemUsage(usages: Array<ShortcutSectionItemUsage>): boolean {
  return httpClient.sendBeacon({
    url: "shortcut/usage/collect",
    body: { usages }
  });
}

export enum ShortcutItemTargetType {
  SelfTab = 0,
  NewTab = 1,
  Embed = 2
}

export enum ShortcutItemIconType {
  Icon = 0,
  Url = 1,
  Text = 2
}

export interface ShortcutIcon extends Model {
  brand: string;
  slug: string;
  color: string;
}

export interface ShortcutItem extends Model {
  title: string;
  description: string;
  url: string;
  iconType: ShortcutItemIconType;
  iconUrl: string;
  iconText: string;
  iconId: number;
  icon: ShortcutIcon;
  tags: string;
  target: ShortcutItemTargetType;
  statusCheck: boolean;
  statusCheckUrl: string;
  backgroundColor: string;
  usages: Array<ShortcutSectionItemUsage>;
}

export interface ShortcutSection extends Model {
  name: string;
  icon: string;
  default: boolean;
  items: ShortcutItem[];
}

export interface ShortcutSectionItemUsage {
  sectionId: number;
  itemId: number;
  clickCount: number;
}
