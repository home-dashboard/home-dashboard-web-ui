import { typeIsObject } from "@siaikin/utils";

type InternalIntlPropType = {
  locales?: string | string[];
  options?: Intl.DateTimeFormatOptions;
};
export type IntlPropType = InternalIntlPropType | string | string[];

export const DefaultIntlProp: InternalIntlPropType = {
  locales: (navigator.languages as string[]) || navigator.language,
  options: { dateStyle: "full" },
};
export const DefaultFormatter = new Intl.DateTimeFormat(
  DefaultIntlProp.locales,
  DefaultIntlProp.options
);

export function mergeIntlProp(target: IntlPropType, source: IntlPropType): InternalIntlPropType {
  const _target: InternalIntlPropType = typeIsObject(target) ? target : { locales: target };
  const _source: InternalIntlPropType = typeIsObject(source) ? source : { locales: source };

  return {
    locales: _source.locales || _target.locales || DefaultIntlProp.locales,
    options: { ...DefaultIntlProp.options, ..._target.options, ..._source.options },
  };
}
