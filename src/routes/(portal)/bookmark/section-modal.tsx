import { createEffect, createMemo, mergeProps, on, splitProps, VoidProps } from "solid-js";
import { createForm } from "@felte/solid";
import { ShortcutSection } from "../../../lib/http-interface";
import { handleInput } from "../../../lib/utils/felte-utils";
import { HDLoadingButton } from "../../../lib/components/button";
import { z } from "zod";
import { validator } from "@felte/validator-zod";
import { notUAN } from "@siaikin/utils";
import { ZodRawShape } from "zod/lib/types";

export function SectionModal(
  props: VoidProps<{
    type?: "create" | "edit";
    formData?: Partial<ShortcutSection>;
    open: boolean;
    onConform: (data: ShortcutSection) => Promise<void> | void;
    onClose: () => void;
  }>
) {
  const [localProps] = splitProps(props, ["type", "formData", "open", "onConform", "onClose"]);
  const mergedProps = mergeProps({ type: "create" }, localProps);

  const {
    form: sectionForm,
    data: sectionFormData,
    handleSubmit: handleSectionFormSubmit,
    setFields: setSectionFormData,
    errors: sectionFormErrors,
    isValid: isSectionFormValid,
    isSubmitting: isSectionFormSubmitting,
    reset: resetSectionForm
  } = createForm({
    extend: validator({
      schema: z.lazy(() => {
        const obj: ZodRawShape = {
          name: z.string().min(1)
        };
        return z.object(obj);
      })
    }),
    onSubmit: async (values) => {
      await props.onConform(values);
      handleModalClose();
    }
  });
  createEffect(
    on(
      () => mergedProps.formData,
      (data) => setSectionFormData({ ...data })
    )
  );

  const titleString = createMemo(() => {
    switch (mergedProps.type) {
      case "edit":
        return "Edit Folder";
      case "create":
      default:
        return "Create Folder";
    }
  });
  const confirmTextString = createMemo(() => {
    switch (mergedProps.type) {
      case "edit":
        return "Save";
      case "create":
      default:
        return "Create";
    }
  });

  function handleModalClose() {
    resetSectionForm();
    mergedProps.onClose();
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
        <form use:sectionForm>
          <cds-stack gap={4}>
            <cds-form-item>
              <cds-text-input
                data-modal-primary-focus=""
                label="Name"
                placeholder="Section name"
                invalid={notUAN(sectionFormErrors().name)}
                invalid-text={sectionFormErrors().name}
                attr:value={sectionFormData().name}
                onInput={[handleInput, { name: "name", setter: setSectionFormData }]}
              />
            </cds-form-item>
          </cds-stack>
        </form>
      </cds-modal-body>

      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" onClick={handleModalClose}>
          Cancel
        </cds-modal-footer-button>
        <HDLoadingButton
          disabled={!isSectionFormValid()}
          kind="primary"
          loading={isSectionFormSubmitting()}
          onClick={handleSectionFormSubmit}
        >
          {confirmTextString()}
        </HDLoadingButton>
      </cds-modal-footer>
    </cds-modal>
  );
}
