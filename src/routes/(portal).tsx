import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { NotificationsPanel } from "../lib/components";
import {
  ConfigurationContext,
  UserNotificationsContext,
  SystemInfoContext
} from "../lib/contextes";
import { signOut, systemInfo, version } from "../lib/http-interface";
import { Outlet, useLocation, createRouteData, useNavigate } from "solid-start";
import { refreshEventSource } from "../lib/http-interface/server-send-event";
import { useRouteData } from "@solidjs/router";
import { UpgradeHeaderActionButton } from "./components/upgrade-header-action-button";
import { DefaultFormatter } from "../lib/utils/intl-utils";

import "./(portal).scss";

const thirdPartySideItems = [
  {
    icon: "simple-icons:wakatime",
    text: "Wakapi Summary",
    href: "/third-party/wakapi"
  }
];

const sideItems = [
  {
    icon: "carbon:dashboard",
    text: "Dashboard",
    href: "/dashboard"
  },
  {
    icon: "carbon:cloud-monitoring",
    text: "Resource Monitoring",
    href: "/system-resource"
  },
  {
    icon: "carbon:cloud-logging",
    text: "Process Monitoring",
    href: "/system-process"
  }
];

export function routeData() {
  return createRouteData(async () => {
    const [configuration, { refresh }] = ConfigurationContext.useContext();
    await refresh();

    const versionInfo = await version();
    const systemInfoStat = await systemInfo();

    return { configuration: configuration(), versionInfo, systemInfo: systemInfoStat };
  });
}

export default function Index() {
  const preloadData = useRouteData<typeof routeData>();

  const navigate = useNavigate();
  const location = useLocation();
  const [userNotifications] = UserNotificationsContext.useContext();

  const [openedPanelName, openPanel] = createSignal<"notifications" | "settings">();
  const triggerPanel = (name: ReturnType<typeof openedPanelName>) =>
    openedPanelName() === name ? openPanel(undefined) : openPanel(name);

  const versionInfoText = createMemo(() => {
    if (preloadData.loading) return "";
    const { version, commit, date } = preloadData()!.versionInfo;
    return `${version} (${commit}) - ${DefaultFormatter.format(date)}`;
  });

  onMount(() => refreshEventSource());
  return (
    <>
      <cds-skip-to-content
        href="#main-content"
        role="navigation"
        aria-label="Skip to main content"
      />
      <div id="main-content" class="pl-12 pt-12 h-full w-full" data-floating-menu-container="">
        <cds-header aria-label="IBM Platform Name">
          <cds-header-menu-button
            button-label-active="Close menu"
            button-label-inactive="Open menu"
            collapse-mode="rail"
          />
          <cds-header-name href="/" prefix="siaikin's" title={versionInfoText()}>
            HOME Dashboard
          </cds-header-name>
          <div class="cds--header__global">
            <UpgradeHeaderActionButton />

            <cds-header-global-action
              tooltip-text={userNotifications.length > 0 ? "New notifications" : "Notifications"}
              tooltip-position="bottom"
              onClick={() => triggerPanel("notifications")}
              active={openedPanelName() === "notifications" ? "true" : undefined}
            >
              <Icon
                slot="icon"
                width={20}
                height={20}
                icon={
                  userNotifications.length > 0 ? "carbon:notification-new" : "carbon:notification"
                }
              />
            </cds-header-global-action>

            <NotificationsPanel expanded={openedPanelName() === "notifications"} />

            <cds-header-global-action
              tooltip-text="User settings"
              tooltip-position="bottom"
              tooltip-alignment="right"
              onClick={() => triggerPanel("settings")}
              active={openedPanelName() === "settings" ? "true" : undefined}
            >
              <Icon slot="icon" width={20} height={20} icon="carbon:user-avatar-filled-alt" />
            </cds-header-global-action>

            <cds-header-panel expanded={openedPanelName() === "settings"}>
              <cds-switcher aria-label="User Settings Container" role="list">
                <cds-switcher-item
                  aria-label="User Settings"
                  href="/settings"
                  role="listitem"
                  tab-index="0"
                >
                  User Settings
                </cds-switcher-item>
                <cds-switcher-divider role="separator" />
                <cds-switcher-item
                  aria-label="Sign out"
                  role="listitem"
                  tab-index="0"
                  href="#"
                  onClick={async () => {
                    await signOut();
                    await navigate("/login", { replace: true });
                  }}
                >
                  Sign out
                </cds-switcher-item>
              </cds-switcher>
            </cds-header-panel>
          </div>
        </cds-header>

        {/* todo: 根据屏幕设置 collapse-mode */}
        <cds-side-nav aria-label="Side navigation" collapse-mode="rail">
          <cds-side-nav-items>
            <For each={sideItems}>
              {(item) => (
                <cds-side-nav-link
                  href="#"
                  active={location.pathname === item.href}
                  onClick={[navigate, item.href]}
                >
                  {item.text}
                  <Icon width={16} height={16} slot="title-icon" icon={item.icon} />
                </cds-side-nav-link>
              )}
            </For>

            <cds-side-nav-divider />

            <For each={thirdPartySideItems}>
              {(item) => (
                <cds-side-nav-link
                  href="#"
                  active={location.pathname === item.href}
                  onClick={[navigate, item.href]}
                >
                  {item.text}
                  <Icon width={16} height={16} slot="title-icon" icon={item.icon} />
                </cds-side-nav-link>
              )}
            </For>

            <cds-side-nav-divider />

            <cds-side-nav-link
              href="#"
              active={location.pathname === "/settings"}
              onClick={[navigate, "/settings"]}
            >
              Settings
              <Icon width={16} height={16} slot="title-icon" icon="carbon:settings" />
            </cds-side-nav-link>
          </cds-side-nav-items>
        </cds-side-nav>

        <main class="cds--content h-full">
          <Show when={!preloadData.loading}>
            <SystemInfoContext.Provider
              systemInfo={preloadData()!.systemInfo}
              versionInfo={preloadData()!.versionInfo}
            >
              <Outlet />
            </SystemInfoContext.Provider>
          </Show>
        </main>
      </div>
    </>
  );
}
