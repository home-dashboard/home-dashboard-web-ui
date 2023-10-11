import {
  bind2FAAuthenticatorApp,
  disable2FA,
  get2FAQRCode,
  getCurrentUser
} from "../../../lib/http-interface";
import { useInteractiveInterval } from "../../../lib/utils/interactive_interval";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { createForm } from "@felte/solid";
import { Icon } from "@iconify-icon/solid";
import { handleInput } from "../../../lib/utils/felte-utils";
import { createResourceDefer } from "../../../lib/utils/create-resource";

import "./styles.scss";
import { SystemInfoAccordionItem } from "./system-info";

export default function Index() {
  const { gotoAfterMoment } = useInteractiveInterval();
  const [userInfo, { refetch }] = createResource(async () => await getCurrentUser());

  // 启用/禁用 2FA 的逻辑
  const [is2FAEnabled, set2FAEnabled] = createSignal();
  createEffect(() => set2FAEnabled(userInfo()?.enable2FA));
  const [confirmDisable2FAModalOpened, setConfirmDisable2FAModalOpened] = createSignal(false);

  const [disable2FAResult, { refetch: handleDisable2FA }] = createResourceDefer(async () => {
    await disable2FA();
    await refetch();

    setConfirmDisable2FAModalOpened(false);

    await gotoAfterMoment("/login");
  });

  // 绑定 Authenticator App 的逻辑
  const {
    form: authenticatorAppForm,
    data: authenticatorAppFormData,
    handleSubmit: handleAuthenticatorAppFormSubmit,
    setData: setAuthenticatorAppFormData,
    isSubmitting: isSubmittingAuthenticatorAppForm
  } = createForm({
    onSubmit: async () => {
      await bind2FAAuthenticatorApp(authenticatorAppFormData().code);

      await gotoAfterMoment("/login");
    },
    initialValues: { code: "" }
  });

  const [qrcodeUrl] = createResource(() => get2FAQRCode());

  return (
    <>
      <cds-accordion alignment="start">
        <cds-accordion-item open={is2FAEnabled()} disabled={!is2FAEnabled()}>
          <div slot="title" class="flex justify-between items-center">
            <span>
              <Icon icon="carbon:two-factor-authentication" inline={true} /> Two-factor
              authentication
            </span>
            <Show
              when={is2FAEnabled()}
              fallback={
                <cds-button kind="primary" size="sm" on:click={() => set2FAEnabled(true)}>
                  Enable
                </cds-button>
              }
            >
              <cds-button
                kind="danger"
                size="sm"
                onClick={() => setConfirmDisable2FAModalOpened(true)}
              >
                Disable
              </cds-button>
            </Show>
          </div>

          <cds-expandable-tile expanded={true} with-interactive={true}>
            <cds-tile-above-the-fold-content slot="above-the-fold-content" class="h-16">
              <strong>
                <Icon icon="carbon:mobile" inline={true} width={16} height={16} /> Authenticator app
              </strong>

              <div class="truncate">
                Use an authentication app or browser extension to get two-factor authentication
                codes when prompted.
              </div>
            </cds-tile-above-the-fold-content>
            <cds-tile-below-the-fold-content style={{ height: "420px" }}>
              <form use:authenticatorAppForm>
                <cds-stack gap={2}>
                  <p>
                    Authenticator apps and browser extensions like{" "}
                    <cds-link href="https://support.1password.com/one-time-passwords/">
                      1Password
                    </cds-link>
                    ,<cds-link href="https://authy.com/guides/github/">Authy</cds-link>,
                    <cds-link href="https://www.microsoft.com/en-us/account/authenticator/">
                      Microsoft Authenticator
                    </cds-link>
                    , etc. generate one-time passwords that are used as a second factor to verify
                    your identity when prompted during sign-in.
                  </p>
                  <h6>Scan the QR code</h6>
                  <p>Use an authenticator app or browser extension to scan.</p>

                  <Show
                    when={!qrcodeUrl.loading}
                    fallback={
                      <cds-inline-loading status="active">Loading QR code...</cds-inline-loading>
                    }
                  >
                    <img src={qrcodeUrl()} alt="qrcode url" />
                  </Show>

                  <h6>Verify the code from the app</h6>

                  <cds-form-item>
                    <cds-text-input
                      hide-label=""
                      placeholder="XXXXXX"
                      maxlength="6"
                      onInput={[handleInput, { name: "code", setter: setAuthenticatorAppFormData }]}
                    />
                  </cds-form-item>

                  <Show
                    when={isSubmittingAuthenticatorAppForm()}
                    fallback={
                      <cds-Button
                        type="submit"
                        disabled={authenticatorAppFormData().code.length !== 6}
                        onClick={[handleAuthenticatorAppFormSubmit]}
                      >
                        Save
                      </cds-Button>
                    }
                  >
                    <cds-Button disabled="" kind="ghost">
                      <cds-inline-loading status="active">binding...</cds-inline-loading>
                    </cds-Button>
                  </Show>
                </cds-stack>
              </form>
            </cds-tile-below-the-fold-content>
          </cds-expandable-tile>
        </cds-accordion-item>
        <SystemInfoAccordionItem />
      </cds-accordion>

      <cds-modal open={confirmDisable2FAModalOpened()}>
        <cds-modal-header>
          <cds-modal-heading>Disable two-factor authentication?</cds-modal-heading>
        </cds-modal-header>

        <cds-modal-body>
          After disable two-factor authentication, you need to log in again.
        </cds-modal-body>

        <cds-modal-footer>
          <cds-modal-footer-button
            kind="secondary"
            disabled={disable2FAResult.loading}
            onClick={[setConfirmDisable2FAModalOpened, false]}
          >
            Cancel
          </cds-modal-footer-button>
          <cds-modal-footer-button
            kind="danger"
            disabled={disable2FAResult.loading}
            onClick={[handleDisable2FA]}
          >
            <Show
              when={!disable2FAResult.loading}
              fallback={<cds-inline-loading status="active">Disabling...</cds-inline-loading>}
            >
              Disable
            </Show>
          </cds-modal-footer-button>
        </cds-modal-footer>
      </cds-modal>
    </>
  );
}
