<script lang="ts">
  import {
    Grid,
    Row,
    Column,
    Tile,
    Form,
    TextInput,
    PasswordInput,
    Checkbox,
    Button,
    ButtonSet,
    Link,
    InlineNotification,
    InlineLoading,
  } from "carbon-components-svelte";
  import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
  import { signIn, validate2FA } from "$lib/http-interface";
  import type { User } from "$lib/http-interface";
  import { INTERACTIVE_INTERVAL } from "$lib/utils/interactive_interval";

  let step = "login";
  let redirectPromise: Promise<void>;

  // 账号密码登录相关逻辑
  const loginForm = { username: "", password: "", rememberMe: false };
  let loginPromise: Promise<User>;
  let userInfo: User;
  async function handleLogin() {
    loginPromise = signIn(loginForm);

    userInfo = await loginPromise;

    if (userInfo.enable2FA) {
      step = "validate2FA";
      return;
    }

    redirectPromise = INTERACTIVE_INTERVAL.gotoAfterMoment("/", { replaceState: true });
  }

  // 2FA 校验相关逻辑
  const authForm = { code: "" };
  let validateCodePromise: Promise<void>;
  async function handleValidateCode() {
    validateCodePromise = validate2FA(authForm.code);
    await validateCodePromise;

    redirectPromise = INTERACTIVE_INTERVAL.gotoAfterMoment("/", { replaceState: true });
  }
</script>

<div class="login-wrapper">
  <Grid style="width: 100%">
    <Row>
      <Column
        sm="{{ span: 4 }}"
        md="{{ span: 4, offset: 2 }}"
        lg="{{ span: 6, offset: 5 }}"
        xlg="{{ span: 6, offset: 5 }}"
        max="{{ span: 5, offset: 5.5 }}"
      >
        <Tile>
          {#if step === "login"}
            <Form on:submit="{handleLogin}">
              <h2>Login in</h2>

              {#await loginPromise}
                <div style="margin-bottom: 3rem"></div>
              {:then _}
                <div style="margin-bottom: 3rem"></div>
              {:catch error}
                <InlineNotification
                  hideCloseButton
                  kind="error"
                  title="Error:"
                  subtitle="Incorrect username or password. Try again."
                />
              {/await}

              <TextInput autofocus labelText="Username" bind:value="{loginForm.username}" />
              <div style="margin-bottom: 1.5rem"></div>

              <PasswordInput bind:value="{loginForm.password}" tooltipPosition="left">
                <svelte:fragment slot="labelText">
                  <span slot="labelText">Password</span>
                  <Link class="forgot-password" href="/sign-in">Forgot password?</Link>
                </svelte:fragment>
              </PasswordInput>
              <div style="margin-bottom: 1.5rem"></div>

              <Checkbox bind:chcked="{loginForm.rememberMe}" labelText="Remember me" />
              <div style="margin-bottom: 2.5rem"></div>

              <ButtonSet>
                <Button kind="ghost">Log in with SMS</Button>

                {#await loginPromise}
                  <Button disabled kind="ghost">
                    <InlineLoading status="active" description="logging..." />
                  </Button>
                {:then _}
                  {#if !!redirectPromise}
                    <Button disabled kind="ghost">
                      <InlineLoading status="finished" description="verified" />
                    </Button>
                  {:else}
                    <Button icon="{ArrowRight}" type="submit">Continue</Button>
                  {/if}
                {:catch _}
                  <Button icon="{ArrowRight}" type="submit">Continue</Button>
                {/await}
              </ButtonSet>
              <div style="margin-bottom: 1rem"></div>

              <div>
                Don't have a account?
                <Link href="/sign-in">Create an account</Link>
              </div>
            </Form>
          {:else if step === "validate2FA"}
            <Form on:submit="{handleValidateCode}">
              <h2>Two-factor authentication</h2>

              {#await validateCodePromise}
                <div style="margin-bottom: 3rem"></div>
              {:then _}
                <div style="margin-bottom: 3rem"></div>
              {:catch error}
                <InlineNotification
                  hideCloseButton
                  kind="error"
                  title="Error:"
                  subtitle="Incorrect code. Try again."
                />
              {/await}

              <TextInput
                autofocus
                labelText="Authentication code"
                maxlength="6"
                placeholder="XXXXXX"
                bind:value="{authForm.code}"
              />
              <div style="margin-bottom: 1.5rem"></div>

              <ButtonSet>
                {#await validateCodePromise}
                  <Button disabled kind="ghost">
                    <InlineLoading status="active" description="verifying..." />
                  </Button>
                {:then _}
                  {#if !!redirectPromise}
                    <Button disabled kind="ghost">
                      <InlineLoading status="finished" description="verified" />
                    </Button>
                  {:else}
                    <Button
                      icon="{ArrowRight}"
                      type="submit"
                      disabled="{authForm.code.length !== 6}"
                    >
                      Verify
                    </Button>
                  {/if}
                {:catch _}
                  <Button icon="{ArrowRight}" type="submit" disabled="{authForm.code.length !== 6}">
                    Verify
                  </Button>
                {/await}
              </ButtonSet>
              <div style="margin-bottom: 1rem"></div>

              <div>
                Open your two-factor authenticator (TOTP) app or browser extension to view your
                authentication code.
              </div>
            </Form>
          {/if}
        </Tile>
      </Column>
    </Row>
  </Grid>
</div>

<style>
  :global(.bx--label) {
    width: 100%;
  }

  :global(.forgot-password) {
    float: right;
  }

  :global(.bx--btn-set) {
    justify-content: flex-end;
  }

  :global(.bx--btn-set) {
    justify-content: flex-end;
  }

  :global(.bx--inline-loading) {
    min-height: auto;
  }

  .login-wrapper {
    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
