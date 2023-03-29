import { httpClient } from "../http-client";

/**
 * 获取配置更新, 用于检查配置是否有更新.
 */
export function getConfigurationUpdates(): Promise<ConfigurationUpdates> {
  return httpClient.get({ url: "configuration/updates" });
}

/**
 * 接口返回的配置更新对象.
 */
export interface ConfigurationUpdates {
  current: ConfigurationModel;
  previous: ConfigurationModel;
}

export interface ConfigurationModel {
  configuration: Configuration;
}

/**
 * 服务端配置对象.
 */
export interface Configuration {
  serverMonitor: ServerMonitorConfiguration;
  /**
   * 配置文件的修改时间.
   */
  modificationTime: number;
}

/**
 * 监控配置对象.
 */
export interface ServerMonitorConfiguration {
  /**
   * 监控服务的端口号. 默认为 8080.
   */
  port: number;
  /**
   * 管理员账号配置.
   */
  administrator: ServerMonitorAdministratorConfiguration;
  /**
   * 开发模式配置.
   */
  development: ServerMonitorDevelopmentConfiguration;
  /**
   * 第三方服务配置.
   */
  thirdParty: ServerMonitorThirdPartyConfiguration;
}

export interface ServerMonitorAdministratorConfiguration {
  /**
   * 管理员用户名, 默认为 "administrator".
   */
  username: string;
  /**
   * 管理员密码, 默认为 "123456".
   */
  password: string;
}

export interface ServerMonitorDevelopmentConfiguration {
  /**
   * 是否启用开发模式, 默认为 false.
   */
  enabled: boolean;
  /**
   * CORS 配置.
   */
  cors: {
    /**
     * 允许的来源, 默认为 空.
     */
    allowOrigin: Array<string>;
  };
}

export interface ServerMonitorThirdPartyConfiguration {
  /**
   * Wakapi 配置.
   */
  wakapi: ServerMonitorThirdPartyWakapiConfiguration;
}

export interface ServerMonitorThirdPartyWakapiConfiguration {
  /**
   * 是否启用 Wakapi, 默认为 false.
   */
  enable: boolean;
  /**
   * Wakapi 的 API Key.
   */
  apiKey: string;
  /**
   * Wakapi 的 API URL.
   */
  apiUrl: string;
}
