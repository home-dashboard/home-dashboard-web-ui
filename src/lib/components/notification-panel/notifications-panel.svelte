<script lang="ts">
  import {
    Button,
    HeaderAction,
    ImageLoader,
    ToastNotification,
    Truncate,
  } from "carbon-components-svelte";
  import Notification from "carbon-icons-svelte/lib/Notification.svelte";
  import NotificationNew from "carbon-icons-svelte/lib/NotificationNew.svelte";
  import { UserNotificationStore, refreshUserNotificationStore } from "../../stores";
  import "./notifications-panel.scss";
  import { roundDurationToString } from "./utils";
  import { typeIsString } from "@siaikin/utils";
  import { markUserNotificationAsRead } from "../../http-interface";
  import type { UserNotification } from "../../http-interface";
  import WakapiLogo from "../../assets/images/wakapi-logo.png";
  import GitHubLogo from "../../assets/images/github-logo-white.svg";

  const logoMap = {
    wakapi: WakapiLogo,
    github: GitHubLogo,
  };
  const blockClass = `${"hd"}--notifications-panel`;

  let isOpen = false;

  function handleOpenNewTab(e: PointerEvent, notification: UserNotification): void {
    const element = e.currentTarget as HTMLDivElement;

    const url = element.dataset.url;
    if (!typeIsString(url)) return;

    // https://developer.chrome.com/docs/lighthouse/best-practices/external-anchors-use-rel-noopener/
    window.open(url, "_blank", "noopener,noreferrer");

    markAsRead(notification);
  }

  function markAsRead(notification: UserNotification): void {
    markUserNotificationAsRead(notification.id);
    refreshUserNotificationStore();
  }

  async function markAllAsRead() {
    await markUserNotificationAsRead();
    refreshUserNotificationStore();
  }
</script>

<HeaderAction
  bind:isOpen="{isOpen}"
  transition="{false}"
  icon="{$UserNotificationStore.notifications.length > 0 ? NotificationNew : Notification}"
  closeIcon="{$UserNotificationStore.notifications.length > 0 ? NotificationNew : Notification}"
>
  <div class="{blockClass}" on:click="{(e) => e.stopPropagation()}">
    <div class="{`${blockClass}__header-container`}">
      <div class="{`${blockClass}__header-flex`}">
        <h3 class="{`${blockClass}__header`}">Notifications</h3>
        <Button
          class="{`${blockClass}__dismiss-button`}"
          kind="ghost"
          size="small"
          on:click="{markAllAsRead}">Clear all</Button
        >
      </div>
      <!--      <Toggle size="sm" class="{`${blockClass}__do-not-disturb-toggle`}">-->
      <!--        <span slot="labelA">Do not disturb</span>-->
      <!--        <span slot="labelB">Do not disturb</span>-->
      <!--      </Toggle>-->
    </div>
    <div class="{`${blockClass}__main-section`}">
      {#each $UserNotificationStore.notifications as notification, index}
        {@const now = Date.now()}
        <ToastNotification
          role="notification"
          fullWidth
          kind="{notification.kind}"
          data-url="{notification.link}"
          on:click="{(e) => handleOpenNewTab(e, notification)}"
          on:close="{() => markAsRead(notification)}"
        >
          <svelte:fragment slot="title">
            <Truncate>{roundDurationToString(notification.originCreateAt - now)}</Truncate>
          </svelte:fragment>
          <svelte:fragment slot="subtitle">
            <Truncate title="{notification.title}">
              {#if logoMap[notification.origin]}
                <ImageLoader
                  class="{`${blockClass}__subtitle-icon`}"
                  src="{logoMap[notification.origin]}"
                />
              {/if}
              {notification.title}
            </Truncate>
          </svelte:fragment>
          <svelte:fragment slot="caption">
            <Truncate title="{notification.caption}">{notification.caption}</Truncate>
          </svelte:fragment>
        </ToastNotification>
      {/each}
    </div>
  </div>
</HeaderAction>
