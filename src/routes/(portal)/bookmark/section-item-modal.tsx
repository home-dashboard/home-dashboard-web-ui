import {
  createMemo,
  createSignal,
  For,
  Match,
  mergeProps,
  splitProps,
  Switch,
  VoidProps
} from "solid-js";
import { createForm } from "@felte/solid";
import {
  extractShortcutItemInfoFromURL,
  ShortcutItem,
  ShortcutItemIconType,
  ShortcutItemTargetType,
  ShortcutSection
} from "../../../lib/http-interface";
import { handleCDSInput, handleInput } from "../../../lib/utils/felte-utils";
import { HDLoadingButton } from "../../../lib/components/button";
import { z } from "zod";
import { validator } from "@felte/validator-zod";
import { notUAN } from "@siaikin/utils";
import { SectionItem } from "./section-item";
import { ZodRawShape } from "zod/lib/types";

export function SectionItemModal(
  props: VoidProps<{
    section: ShortcutSection;
    type?: "create" | "update";
    formData?: Partial<ShortcutItem>;
    open: boolean;
    onConform: (data: ShortcutItem) => Promise<void> | void;
    onClose: () => void;
  }>
) {
  const [localProps] = splitProps(props, ["type", "formData", "open", "onConform", "onClose"]);
  const mergedProps = mergeProps(
    { type: "create", formData: { url: "" } as Partial<ShortcutItem> },
    localProps
  );

  const {
    form: searchForm,
    data: searchFormData,
    handleSubmit: handleSearchFormSubmit,
    setFields: setSearchFormData,
    errors: searchFormErrors,
    setErrors: setSearchFormError,
    isValid: isSearchFormValid,
    validate: validateSearchForm,
    isSubmitting: isSearchFormSubmitting
  } = createForm({
    extend: validator({
      schema: z.lazy(() => {
        const obj: ZodRawShape = {};
        switch (step()) {
          case 0:
            obj["url"] = z.string().min(1);
            break;
          case 2:
            obj["title"] = z.string().min(1);
            obj["description"] = z.string();
            obj["iconType"] = z.nativeEnum(ShortcutItemIconType);
            obj["iconUrl"] = z.string();
            break;
        }
        return z.object(obj);
      })
    }),
    onSubmit: async (values) => {
      await props.onConform(values);
      handleModalClose();
    },
    initialValues: mergedProps.formData
  });

  const titleString = createMemo(() => {
    switch (mergedProps.type) {
      case "update":
        return "Update Shortcut Item";
      case "create":
      default:
        return "Create Shortcut Item";
    }
  });

  const [step, setStep] = createSignal(mergedProps.type === "create" ? 0 : 1);
  const [alternativeItems, setAlternativeItems] = createSignal([] as Array<ShortcutItem>);
  const [selectedAlternativeItem, setSelectedAlternativeItem] = createSignal<ShortcutItem>();

  async function handleFetchWebsiteInfo(url: string) {
    try {
      if (!url.toLowerCase().startsWith("http")) url = `http://${url}`;

      const { item: itemInfo, alternatives } = await extractShortcutItemInfoFromURL(url);
      setSearchFormData({
        ...searchFormData(),
        ...itemInfo,
        iconType: 1,
        target: 1
      });
      await validateSearchForm();
      setAlternativeItems(alternatives);

      /**
       * 1. 如果 alternatives 为空，说明没有已经存在的 item，直接进入第二步
       * 2. 如果 alternatives 只有一个，说明已经存在，默认选中唯一的一个，进入第一步
       * 3. 如果 alternatives 大于一个，说明有多个已经存在，进入第一步
       */
      if (alternatives.length <= 0) {
        setStep(2);
      } else if (alternatives.length === 1) {
        setSelectedAlternativeItem(alternatives[0]);
        setStep(1);
      } else {
        setStep(1);
      }
      setStep(alternatives.length > 0 ? 1 : 2);
    } catch (e) {
      setSearchFormError({ url: (e as Error).message });
    }
  }

  function handleModalClose() {
    mergedProps.onClose();
    setStep(0);
    setAlternativeItems([]);
  }

  return (
    <cds-modal
      prevent-close-on-click-outside={true}
      open={mergedProps.open}
      on:cds-modal-closed={handleModalClose}
    >
      <cds-modal-header>
        <cds-modal-close-button />
        <cds-modal-heading>{titleString()}</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <form use:searchForm>
          <cds-stack gap={4}>
            <Switch>
              <Match when={step() === 0}>
                <cds-form-item>
                  <cds-text-input
                    data-modal-primary-focus=""
                    label="URL"
                    name="url"
                    invalid={notUAN(searchFormErrors().url)}
                    invalid-text={searchFormErrors().url}
                    helper-text="By default, the HTTP protocol is used unless HTTPS is specified."
                    placeholder="http(s)://xxxx.xxx"
                    attr:value={searchFormData().url}
                    onInput={[handleInput, { name: "url", setter: setSearchFormData }]}
                  />
                </cds-form-item>
                <HDLoadingButton
                  disabled={!isSearchFormValid()}
                  kind="primary"
                  onLoadingClick={() => handleFetchWebsiteInfo(searchFormData().url)}
                >
                  Next step
                </HDLoadingButton>
              </Match>
              <Match when={step() === 1}>
                <For each={alternativeItems()}>
                  {(item) => (
                    <SectionItem
                      item={item}
                      type="radio"
                      selected={selectedAlternativeItem() === item}
                      onSelected={() => setSelectedAlternativeItem(item)}
                    />
                  )}
                </For>
                <p>
                  Find existing shortcut item. Maybe you can use it directly. Or you can create a
                  new.
                </p>
              </Match>
              <Match when={step() === 2}>
                <cds-form-item>
                  <cds-text-input
                    label="URL"
                    placeholder="website url"
                    disabled={true}
                    attr:value={searchFormData().url}
                  />
                </cds-form-item>
                <cds-form-item>
                  <cds-text-input
                    label="Title"
                    placeholder="maybe a website name"
                    invalid={notUAN(searchFormErrors().title)}
                    invalid-text={searchFormErrors().title}
                    attr:value={searchFormData().title}
                    onInput={[handleInput, { name: "title", setter: setSearchFormData }]}
                  />
                </cds-form-item>
                <cds-form-item>
                  <cds-text-input
                    label="Description"
                    placeholder="website description or something else"
                    attr:value={searchFormData().description}
                    onInput={[handleInput, { name: "description", setter: setSearchFormData }]}
                  />
                </cds-form-item>
                <cds-form-item>
                  <cds-radio-button-group
                    legend-text="Icon type"
                    attr:value={searchFormData().iconType}
                    on:cds-radio-button-group-changed={(event: CustomEvent) =>
                      handleInput({ name: "iconType", setter: setSearchFormData }, event)
                    }
                  >
                    <cds-radio-button
                      label-text="Iconify icon"
                      disabled={true}
                      value={ShortcutItemIconType.Icon.toString()}
                    />
                    <cds-radio-button
                      label-text="URL"
                      value={ShortcutItemIconType.Url.toString()}
                    />
                    <cds-radio-button
                      label-text="Text"
                      disabled={true}
                      value={ShortcutItemIconType.Text.toString()}
                    />
                  </cds-radio-button-group>
                </cds-form-item>
                <cds-form-item class="flex-row">
                  <Switch>
                    <Match when={searchFormData().iconType === ShortcutItemIconType.Url}>
                      <img
                        src={searchFormData().iconUrl}
                        alt={searchFormData().iconUrl}
                        class="w-8 h-8 self-end p-1"
                      />
                      <cds-text-input
                        label="Icon url"
                        attr:value={searchFormData().iconUrl}
                        onInput={[handleInput, { name: "iconUrl", setter: setSearchFormData }]}
                      />
                    </Match>
                  </Switch>
                </cds-form-item>
                <cds-form-item>
                  <cds-radio-button-group
                    legend-text="Target"
                    attr:value={searchFormData().target}
                    orientation="horizontal"
                    on:cds-radio-button-group-changed={[
                      handleCDSInput,
                      { name: "target", setter: setSearchFormData }
                    ]}
                  >
                    <cds-radio-button
                      label-text="Self tab"
                      value={ShortcutItemTargetType.SelfTab.toString()}
                    />
                    <cds-radio-button
                      label-text="New tab"
                      value={ShortcutItemTargetType.NewTab.toString()}
                    />
                    <cds-radio-button
                      label-text="Embed"
                      disabled={true}
                      value={ShortcutItemTargetType.Embed.toString()}
                    />
                  </cds-radio-button-group>
                </cds-form-item>
                <cds-form-item>
                  <cds-checkbox
                    label-text="Status check"
                    attr:value={searchFormData().statusCheck}
                    on:cds-checkbox-changed={[
                      handleCDSInput,
                      { name: "statusCheck", setter: setSearchFormData }
                    ]}
                  />
                </cds-form-item>
              </Match>
            </Switch>
          </cds-stack>
        </form>
      </cds-modal-body>

      <Switch>
        <Match when={step() === 1}>
          <cds-modal-footer>
            <cds-modal-footer-button
              kind="secondary"
              onClick={() => {
                setSearchFormData("id", 0);
                setStep(2);
              }}
            >
              Create new
            </cds-modal-footer-button>
            <cds-modal-footer-button
              kind="primary"
              onClick={() => {
                setSearchFormData(selectedAlternativeItem()!);
                handleSearchFormSubmit();
              }}
              disabled={!selectedAlternativeItem()}
            >
              Use directly
            </cds-modal-footer-button>
          </cds-modal-footer>
        </Match>
        <Match when={step() === 2}>
          <cds-modal-footer>
            <cds-modal-footer-button kind="secondary" onClick={handleModalClose}>
              Cancel
            </cds-modal-footer-button>
            <HDLoadingButton
              disabled={!isSearchFormValid()}
              kind="primary"
              loading={isSearchFormSubmitting()}
              onClick={handleSearchFormSubmit}
            >
              Add
            </HDLoadingButton>
          </cds-modal-footer>
        </Match>
      </Switch>
    </cds-modal>
  );
}
