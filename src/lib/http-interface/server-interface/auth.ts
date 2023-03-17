import { httpClient } from "../http-client";

export function signIn(params: {
  username: string;
  password: string;
  rememberMe: boolean;
}): Promise<void> {
  return httpClient.post({ url: "auth", body: params });
}

export function signOut(): Promise<void> {
  return httpClient.post({ url: "unauth" });
}
