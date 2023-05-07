import { httpClient } from "../http-client";

export function signIn(params: {
  username: string;
  password: string;
  rememberMe: boolean;
}): Promise<User> {
  return httpClient.post({ url: "auth", body: params });
}

export function signOut(): Promise<void> {
  return httpClient.post({ url: "unauth" });
}

/**
 * 获取当前登录用户信息.
 */
export function getCurrentUser(): Promise<User> {
  return httpClient.get({ url: "user/current" });
}

/**
 * 关闭所有方式的双因素认证.
 */
export function disable2FA(): Promise<void> {
  return httpClient.post({ url: "auth/2fa/disable" });
}

/**
 * 获取用于绑定双因素认证 app 的二维码.
 */
export async function get2FAQRCode(): Promise<string> {
  const result = await httpClient.request<Blob>({
    url: "auth/2fa/qrcode",
    method: "GET",
    responseType: "blob",
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(result.response);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 绑定双因素认证 app. 会验证 code 的有效性. 验证通过后会将用户的 enable2FA 设置为 true.
 * @param code
 */
export function bind2FAAuthenticatorApp(code: string): Promise<void> {
  return httpClient.post({ url: "auth/2fa/bind/app", body: { code } });
}

/**
 * 验证 2FA code.
 * @param code
 */
export function validate2FA(code: string): Promise<void> {
  return httpClient.post({ url: "auth/2fa/validate", body: { code } });
}

export interface User {
  role: number;
  username: string;
  enable2FA: boolean;
}
