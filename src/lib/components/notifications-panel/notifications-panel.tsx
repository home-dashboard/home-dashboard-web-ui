import { Icon } from "@iconify-icon/solid";
import { UserNotificationsContext } from "../../contextes";
import { roundDurationToString } from "./utils";
import { notUAN, typeIsString } from "@siaikin/utils";
import { markUserNotificationAsRead } from "../../http-interface";
import type { UserNotification } from "../../http-interface";
import { For, mergeProps, Show, VoidProps } from "solid-js";

import "./notifications-panel.scss";

export default function NotificationsPanel(props: VoidProps<{ expanded: boolean }>) {
  const [userNotifications, { refresh }] = UserNotificationsContext.useContext();
  refresh().then();

  const mergedProps = mergeProps({ expanded: false }, props);

  const logoMap: Record<string, string> = {
    wakapi: "simple-icons:wakatime",
    github: "carbon:logo-github"
  };
  const blockClass = `${"hd"}--notifications-panel`;

  async function handleOpenNewTab(notification: UserNotification) {
    if (!typeIsString(notification.link)) return;

    // https://developer.chrome.com/docs/lighthouse/best-practices/external-anchors-use-rel-noopener/
    window.open(notification.link, "_blank", "noopener,noreferrer");

    await markAsRead(notification);
  }

  async function markAsRead(notification: UserNotification) {
    await markUserNotificationAsRead(notification.id);
    await refresh();
  }

  async function markAllAsRead() {
    await markUserNotificationAsRead();
    await refresh();
  }

  return (
    <cds-header-panel
      id="notifications-panel"
      class={`${blockClass}__wrapper`}
      expanded={mergedProps.expanded}
    >
      <div class={blockClass}>
        <div class={`${blockClass}__header-container`}>
          <div class={`${blockClass}__header-flex`}>
            <h3 class={`${blockClass}__header`}>Notifications</h3>
            <cds-button
              class={`${blockClass}__dismiss-button`}
              kind="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Clear all
            </cds-button>
          </div>
        </div>
        <div class={`${blockClass}__main-section`}>
          <For each={userNotifications}>
            {(notification) => {
              const now = Date.now();
              return (
                <cds-toast-notification
                  class="mb-0.5"
                  role="notification"
                  kind={notification.kind}
                  caption={roundDurationToString(notification.originCreateAt - now)}
                  on:cds-notification-closed={() => markAsRead(notification)}
                >
                  <div
                    slot="title"
                    title={notification.title}
                    class="flex justify-start items-center w-48 text-xs"
                  >
                    <Show when={notUAN(logoMap[notification.origin])}>
                      <Icon
                        width={16}
                        height={16}
                        class={`${blockClass}__subtitle-icon`}
                        icon={logoMap[notification.origin]}
                      />
                    </Show>
                    <span class="truncate">{notification.title}</span>
                  </div>
                  <div
                    slot="subtitle"
                    class="cursor-pointer mt-2"
                    onClick={[handleOpenNewTab, notification]}
                  >
                    {notification.caption}
                  </div>
                </cds-toast-notification>
              );
            }}
          </For>
        </div>
      </div>
    </cds-header-panel>
  );
}
