<script lang="ts">
  import {
    Header,
    // HeaderNav,
    // HeaderNavItem,
    // HeaderNavMenu,
    HeaderUtilities,
    HeaderAction,
    HeaderPanelLinks,
    HeaderPanelLink,
    SideNav,
    SideNavItems,
    SideNavLink,
    SkipToContent,
    Content,
    HeaderPanelDivider,
  } from "carbon-components-svelte";
  import DashboardIcon from "carbon-icons-svelte/lib/Dashboard.svelte";
  import ResourceMonitoringIcon from "carbon-icons-svelte/lib/CloudMonitoring.svelte";
  import ProcessMonitoringIcon from "carbon-icons-svelte/lib/CloudLogging.svelte";
  // import UserAvatarIcon from "carbon-icons-svelte/lib/UserAvatar.svelte";
  // import UserAvatarFilledIcon from "carbon-icons-svelte/lib/UserAvatarFilled.svelte";
  import UserAvatarFilledAltIcon from "carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte";
  import { afterNavigate, goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { onMount } from "svelte";
  import { refreshEventSource } from "../../lib/http-interface/server-send-event";
  import { signOut } from "../../lib/http-interface";

  let isSideNavOpen = false;
  let currentPath = "";

  onMount(() => refreshEventSource());
  afterNavigate((navigation) => (currentPath = navigation.to.url.pathname));
</script>

<Header company="HOME" platformName="Dashboard" bind:isSideNavOpen="{isSideNavOpen}">
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>

  <!--  <HeaderNav>-->
  <!--    <HeaderNavItem href="/" text="Link 1" />-->
  <!--    <HeaderNavItem href="/" text="Link 2" />-->
  <!--    <HeaderNavItem href="/" text="Link 3" />-->
  <!--    <HeaderNavMenu text="Menu">-->
  <!--      <HeaderNavItem href="/" text="Link 1" />-->
  <!--      <HeaderNavItem href="/" text="Link 2" />-->
  <!--      <HeaderNavItem href="/" text="Link 3" />-->
  <!--    </HeaderNavMenu>-->
  <!--    <HeaderNavItem href="/" text="Link 4" />-->
  <!--  </HeaderNav>-->

  <HeaderUtilities>
    <HeaderAction icon="{UserAvatarFilledAltIcon}" closeIcon="{UserAvatarFilledAltIcon}">
      <HeaderPanelLinks>
        <HeaderPanelDivider />

        <HeaderPanelLink
          on:click="{async () => {
            await signOut();
            await goto('/login', { replaceState: true });
          }}">Sign out</HeaderPanelLink
        >
      </HeaderPanelLinks>
    </HeaderAction>
  </HeaderUtilities>
</Header>

<SideNav bind:isOpen="{isSideNavOpen}" rail>
  <SideNavItems>
    {#if true}
      {@const path = `${base}/`}
      <SideNavLink
        icon="{DashboardIcon}"
        text="Dashboard"
        href="{path}"
        isSelected="{currentPath === path}"
      />
    {/if}
    {#if true}
      {@const path = `${base}/system-resource`}
      <SideNavLink
        icon="{ResourceMonitoringIcon}"
        text="Resource Monitoring"
        href="{path}"
        isSelected="{currentPath === path}"
      />
    {/if}
    {#if true}
      {@const path = `${base}/system-process`}
      <SideNavLink
        icon="{ProcessMonitoringIcon}"
        text="Process Monitoring"
        href="{path}"
        isSelected="{currentPath === path}"
      />
    {/if}
    <!--    <SideNavMenu icon="{ProcessMonitoringIcon}" text="Process Monitoring" href="/system-process">-->
    <!--      <SideNavMenuItem href="/" text="Link 1" />-->
    <!--      <SideNavMenuItem href="/" text="Link 2" />-->
    <!--      <SideNavMenuItem href="/" text="Link 3" />-->
    <!--    </SideNavMenu>-->
    <!--    <SideNavDivider />-->
    <!--    <SideNavLink icon="{Dashboard}" text="Link 4" href="/" />-->
  </SideNavItems>
</SideNav>

<Content id="main-content">
  <slot />
</Content>

<style lang="scss">
  @import "../../../node_modules/carbon-components/scss/components/ui-shell/functions";

  :global(#main-content) {
    height: calc(100vh - #{mini-units(6)});
    overflow: auto;
  }
</style>
