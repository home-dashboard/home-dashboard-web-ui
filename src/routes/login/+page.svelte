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
  import { signIn } from "../../lib/http-interface";
  import { goto } from "$app/navigation";

  const loginForm = {
    username: "",
    password: "",
    rememberMe: false,
  };

  let loginPromise: Promise<void>;

  async function handleLogin() {
    loginPromise = signIn(loginForm);

    await loginPromise;

    await goto("/", { replaceState: true });
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

            <TextInput
              style="margin-bottom: 1.5rem"
              autofocus
              labelText="Username"
              bind:value="{loginForm.username}"
            />

            <div style="margin-bottom: 1.5rem">
              <PasswordInput bind:value="{loginForm.password}" tooltipPosition="left">
                <svelte:fragment slot="labelText">
                  <span slot="labelText">Password</span>
                  <Link class="forgot-password" href="/sign-in">Forgot password?</Link>
                </svelte:fragment>
              </PasswordInput>
            </div>

            <Checkbox
              style="margin-bottom: 2.5rem"
              bind:chcked="{loginForm.rememberMe}"
              labelText="Remember me"
            />

            <ButtonSet style="margin-bottom: 1rem">
              <Button kind="ghost">Log in with SMS</Button>

              {#await loginPromise}
                <InlineLoading status="active" description="logging..." />
              {:then _}
                <Button icon="{ArrowRight}" type="submit">Continue</Button>
              {:catch _}
                <Button icon="{ArrowRight}" type="submit">Continue</Button>
              {/await}
            </ButtonSet>

            <div>
              Don't have a account?
              <Link href="/sign-in">Create an account</Link>
            </div>
          </Form>
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

  :global(.bx--btn-set .bx--btn) {
    flex: 1 1 auto;
  }

  .login-wrapper {
    width: 100vw;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
