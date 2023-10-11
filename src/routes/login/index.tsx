import { signIn, validate2FA } from "../../lib/http-interface";
import { Icon } from "@iconify-icon/solid";
import { useInteractiveInterval } from "../../lib/utils/interactive_interval";
import { createResource, createSignal, Match, Show, Switch } from "solid-js";
import { createForm } from "@felte/solid";

import "./styles.scss";
import { handleInput } from "../../lib/utils/felte-utils";

export default function Index() {
  const { gotoAfterMoment } = useInteractiveInterval();
  const [step, setStep] = createSignal<"login" | "validate2FA">("login");

  const [redirectPath, setRedirectPath] = createSignal<string>();
  const [redirectStatus] = createResource(redirectPath, (path) =>
    gotoAfterMoment(path, { replace: true })
  );

  const {
    form: loginForm,
    isSubmitting: isLoginFormSubmitting,
    errors: loginFormErrors,
    handleSubmit: handleLoginFormSubmit,
    setFields: setLoginFormFields
  } = createForm({
    onSubmit: async (loginForm) => {
      const userInfo = await signIn(loginForm);

      if (userInfo.enable2FA) {
        setStep("validate2FA");
        return;
      }

      setRedirectPath("/");
      return userInfo;
    },
    onError: () => ({
      username: "Incorrect username or password. Try again.",
      password: "Incorrect username or password. Try again."
    }),
    initialValues: { username: "", password: "", rememberMe: false }
  });

  // 2FA 校验相关逻辑
  const {
    form: authForm,
    data: autoFormData,
    isSubmitting: isAuthFormSubmitting,
    errors: authFormErrors,
    handleSubmit: handleAuthFormSubmit,
    setFields: setAuthFormFields
  } = createForm({
    onSubmit: async (authForm) => {
      await validate2FA(authForm.code);
      setRedirectPath("/");
    },
    onError: () => ({ code: "Incorrect code. Try again." }),
    initialValues: { code: "" }
  });

  return (
    <div class="login-wrapper">
      <div class="cds--grid w-full">
        <div class="cds--row">
          <div class="cds--col-sm-4 cds--col-md-4 cds--offset-md-2 cds--col-lg-6 cds--offset-lg-5 cds--col-xlg-6 cds--offset-xlg-5 cds--col-max-5 cds--offset-max-5">
            <cds-tile>
              <Switch>
                <Match when={step() === "login"}>
                  <form use:loginForm>
                    <cds-stack gap="6">
                      <h2>Login in</h2>

                      <Show when={loginFormErrors().password || loginFormErrors().username}>
                        <cds-inline-notification
                          hide-close-button=""
                          kind="error"
                          title="Error:"
                          subtitle="Incorrect username or password. Try again."
                        />
                      </Show>

                      <cds-text-input
                        autofocus=""
                        label="Username"
                        onInput={[handleInput, { name: "username", setter: setLoginFormFields }]}
                      />

                      <cds-stack gap={3}>
                        <cds-text-input
                          label="Password"
                          show-password-visibility-toggle=""
                          type="password"
                          onInput={[handleInput, { name: "password", setter: setLoginFormFields }]}
                        />
                        <div style={{ "text-align": "right" }}>
                          <cds-link href="/sign-in">Forgot password?</cds-link>
                        </div>
                      </cds-stack>

                      <cds-checkbox name="rememberMe" label-text="Remember me" />

                      <cds-stack gap="5">
                        <div class="flex">
                          <cds-button class="flex-1" kind="ghost">
                            Log in with SMS
                          </cds-button>

                          <Switch
                            fallback={
                              <cds-button
                                class="flex-1"
                                role="button"
                                type="submit"
                                onClick={handleLoginFormSubmit}
                              >
                                Continue
                                <Icon slot="icon" icon="carbon:arrow-right" />
                              </cds-button>
                            }
                          >
                            <Match when={isLoginFormSubmitting()}>
                              <cds-button class="flex-1" disabled="" kind="ghost">
                                <cds-inline-loading class="min-h-0 h-4" status="active">
                                  logging...
                                </cds-inline-loading>
                              </cds-button>
                            </Match>
                            <Match when={redirectStatus.loading}>
                              <cds-button class="flex-1" disabled="" kind="ghost">
                                <cds-inline-loading class="min-h-0 h-4" status="finished">
                                  verified
                                </cds-inline-loading>
                              </cds-button>
                            </Match>
                          </Switch>
                        </div>
                        <div>
                          Don't have a account?
                          <cds-link href="/sign-in">Create an account</cds-link>
                        </div>
                      </cds-stack>
                    </cds-stack>
                  </form>
                </Match>
                <Match when={step() === "validate2FA"}>
                  <form use:authForm>
                    <cds-stack gap={6}>
                      <h2>Two-factor authentication</h2>

                      <Show when={authFormErrors().code}>
                        <cds-inline-notification
                          hide-close-button=""
                          kind="error"
                          title="Error:"
                          subtitle="Incorrect code. Try again."
                        />
                      </Show>

                      <cds-text-input
                        autofocus=""
                        label="Authentication code"
                        maxlength="6"
                        placeholder="XXXXXX"
                        onInput={[handleInput, { name: "code", setter: setAuthFormFields }]}
                      />

                      <cds-stack gap="5">
                        <div class="flex">
                          <Switch
                            fallback={
                              <cds-button
                                class="flex-1"
                                type="submit"
                                disabled={autoFormData().code.length !== 6}
                                onClick={handleAuthFormSubmit}
                              >
                                Verify
                                <Icon slot="icon" icon="carbon:arrow-right" />
                              </cds-button>
                            }
                          >
                            <Match when={isAuthFormSubmitting()}>
                              <cds-button class="flex-1" disabled="" kind="ghost">
                                <cds-inline-loading class="min-h-0 h-4" status="active">
                                  verifying...
                                </cds-inline-loading>
                              </cds-button>
                            </Match>
                            <Match when={redirectStatus.loading}>
                              <cds-button class="flex-1" disabled="" kind="ghost">
                                <cds-inline-loading class="min-h-0 h-4" status="finished">
                                  verified
                                </cds-inline-loading>
                              </cds-button>
                            </Match>
                          </Switch>
                        </div>

                        <div>
                          Open your two-factor authenticator (TOTP) app or browser extension to view
                          your authentication code.
                        </div>
                      </cds-stack>
                    </cds-stack>
                  </form>
                </Match>
              </Switch>
            </cds-tile>
          </div>
        </div>
      </div>
    </div>
  );
}
