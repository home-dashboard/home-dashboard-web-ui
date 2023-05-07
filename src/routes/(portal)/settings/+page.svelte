<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    ExpandableTile,
    Form,
    ImageLoader,
    InlineLoading,
    Modal,
    OutboundLink,
    TextInput,
    Truncate,
  } from "carbon-components-svelte";
  import MobileIcon from "carbon-icons-svelte/lib/Mobile.svelte";
  import { bind2FAAuthenticatorApp, disable2FA, get2FAQRCode } from "$lib/http-interface";
  import type { User } from "$lib/http-interface";
  import { INTERACTIVE_INTERVAL } from "../../../lib/utils/interactive_interval";

  import "./+page.scss";

  export let data: { user: User };
  // 用于保存路由跳转的 Promise. 用于在路由跳转时, 切换页面状态提示.
  let redirectPromise: Promise<void>;

  // 启用/禁用 2FA 的逻辑
  let is2FAEnabled = data.user.enable2FA;
  let isConfirmDisable2FAModalOpened = false;
  let trigger2faEnableStatePromise: Promise<void>;
  async function handleTrigger2FAEnableState() {
    trigger2faEnableStatePromise = disable2FA();
    await trigger2faEnableStatePromise;

    isConfirmDisable2FAModalOpened = false;

    redirectPromise = INTERACTIVE_INTERVAL.gotoAfterMoment("/login");
  }

  // 绑定 Authenticator App 的逻辑
  let authenticatorAppFormData = { code: "" };
  let bindingAuthenticatorAppPromise: Promise<void>;
  async function handleBindingAuthenticatorApp() {
    bindingAuthenticatorAppPromise = bind2FAAuthenticatorApp(authenticatorAppFormData.code);
    await bindingAuthenticatorAppPromise;

    redirectPromise = INTERACTIVE_INTERVAL.gotoAfterMoment("/login");
  }
</script>

<Accordion align="start">
  <AccordionItem open disabled="{!is2FAEnabled}" title="Two-factor authentication">
    <svelte:fragment slot="title">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>Two-factor authentication</span>
        {#if is2FAEnabled}
          <Button
            kind="danger"
            size="small"
            on:click="{(ev) => (ev.stopPropagation(), (isConfirmDisable2FAModalOpened = true))}"
          >
            Disable
          </Button>
        {:else}
          <Button kind="primary" size="small" on:click="{() => (is2FAEnabled = true)}">
            Enable
          </Button>
        {/if}
      </div>
    </svelte:fragment>

    <ExpandableTile tileCollapsedIconText="" tileExpandedIconText="">
      <svelte:fragment slot="above">
        <strong>
          <MobileIcon class="icon--inline" /> Authenticator app
        </strong>

        <!-- todo 优化字体大小 fontSize: 12px -->
        <Truncate>
          Use an authentication app or browser extension to get two-factor authentication codes when
          prompted.
        </Truncate>
      </svelte:fragment>
      <svelte:fragment slot="below">
        <Form on:submit="{handleBindingAuthenticatorApp}" on:click="{(ev) => ev.stopPropagation()}">
          <p>
            Authenticator apps and browser extensions like <OutboundLink
              href="https://support.1password.com/one-time-passwords/">1Password</OutboundLink
            >, <OutboundLink href="https://authy.com/guides/github/">Authy</OutboundLink>, <OutboundLink
              href="https://www.microsoft.com/en-us/account/authenticator/"
              >Microsoft Authenticator</OutboundLink
            >, etc. generate one-time passwords that are used as a second factor to verify your
            identity when prompted during sign-in.
          </p>
          <div style="margin-bottom: 0.5rem"></div>

          <h6>Scan the QR code</h6>
          <div style="margin-bottom: 0.5rem"></div>

          <p>Use an authenticator app or browser extension to scan.</p>
          <div style="width: 144px;">
            {#await get2FAQRCode()}
              <ImageLoader>
                <svelte:fragment slot="loading"><InlineLoading /></svelte:fragment>
              </ImageLoader>
            {:then dataUrl}
              <ImageLoader src="{dataUrl}" />
            {:catch error}
              <ImageLoader>
                <svelte:fragment slot="error">{error}</svelte:fragment>
              </ImageLoader>
            {/await}
          </div>

          <h6>Verify the code from the app</h6>
          <div style="margin-bottom: 1rem"></div>

          {#await bindingAuthenticatorAppPromise}
            <TextInput disabled hideLabel value="{authenticatorAppFormData.code}" />
          {:then _}
            <TextInput
              hideLabel
              placeholder="XXXXXX"
              maxlength="6"
              bind:value="{authenticatorAppFormData.code}"
            />
          {:catch error}
            <TextInput
              hideLabel
              placeholder="XXXXXX"
              invalid
              invalidText="{error}"
              maxlength="6"
              bind:value="{authenticatorAppFormData.code}"
            />
          {/await}

          <div style="margin-bottom: 1rem"></div>

          {#await bindingAuthenticatorAppPromise}
            <Button disabled kind="ghost">
              <InlineLoading status="active" description="binding..." />
            </Button>
          {:then _}
            {#if !!redirectPromise}
              <Button disabled kind="ghost">
                <InlineLoading status="finished" description="bind success" />
              </Button>
            {:else}
              <Button type="submit" disabled="{authenticatorAppFormData.code.length !== 6}">
                Save
              </Button>
            {/if}
          {:catch _}
            <Button type="submit" disabled="{authenticatorAppFormData.code.length !== 6}">
              Save
            </Button>
          {/await}
        </Form>
      </svelte:fragment>
    </ExpandableTile>
  </AccordionItem>
</Accordion>

<Modal
  danger
  bind:open="{isConfirmDisable2FAModalOpened}"
  modalHeading="Disable two-factor authentication?"
  primaryButtonDisabled="{!!trigger2faEnableStatePromise}"
  primaryButtonIcon="{trigger2faEnableStatePromise ? InlineLoading : undefined}"
  primaryButtonText="Disable"
  secondaryButtonText="Cancel"
  on:click:button--primary="{handleTrigger2FAEnableState}"
  on:click:button--secondary="{() => (isConfirmDisable2FAModalOpened = false)}"
>
  After disable two-factor authentication, you need to log in again.
</Modal>

<style lang="scss">
</style>
