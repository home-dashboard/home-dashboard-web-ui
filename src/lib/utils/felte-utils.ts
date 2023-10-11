import { createForm } from "@felte/solid";

export function handleInput(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { name, setter }: { name: string; setter: ReturnType<typeof createForm<any, any>>["setFields"] },
  event: CustomEvent
) {
  const element = (event.currentTarget ?? event.target) as HTMLInputElement;

  switch (element.type) {
    case "checkbox":
    case "radio":
      setter(name, element.checked, true);
      break;
    default:
      setter(name, element.value, true);
  }
}

export function handleCDSInput(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { name, setter }: { name: string; setter: ReturnType<typeof createForm<any, any>>["setFields"] },
  event: CustomEvent
) {
  const element = (event.currentTarget ?? event.target) as HTMLInputElement;
  const nodeName = element.nodeName.toLowerCase();

  if (nodeName.includes("checkbox") || nodeName.includes("radio")) {
    setter(name, element.checked, true);
  } else {
    setter(name, element.value, true);
  }
}
