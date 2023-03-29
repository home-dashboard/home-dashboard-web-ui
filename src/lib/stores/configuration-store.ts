import { writable } from "svelte/store";
import type { ConfigurationUpdates } from "../http-interface";

export const store = writable<ConfigurationUpdates>({} as ConfigurationUpdates);
