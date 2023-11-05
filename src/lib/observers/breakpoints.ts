import { BehaviorSubject } from "rxjs";
import { notUAN } from "@siaikin/utils";
import { isServer } from "../../global-config";

/**
 * Pixel sizes of Carbon grid breakpoints.
 * @see https://github.com/carbon-design-system/carbon/blob/c286fd43f3f654785f026a57b626fc00eba29fab/packages/layout/src/index.js#L45C29-L45C29
 */
const breakpoints = {
  sm: {
    width: 320,
    columns: 4,
    margin: 0
  },
  md: {
    width: 672,
    columns: 8,
    margin: 16
  },
  lg: {
    width: 1056,
    columns: 16,
    margin: 16
  },
  xlg: {
    width: 1312,
    columns: 16,
    margin: 16
  },
  max: {
    width: 1584,
    columns: 16,
    margin: 24
  }
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 */
export function observe() {
  const subject = new BehaviorSubject<Breakpoint>("sm");
  const methods = {
    /**
     * 当前断点是否小于 {@link size}.
     */
    smallerThan: (size: Breakpoint) => {
      checkSizeValid(size);
      return breakpoints[subject.value].width < breakpoints[size].width;
    },

    /**
     * 当前断点是否大于 {@link size}.
     */
    largerThan: (size: Breakpoint) => {
      checkSizeValid(size);
      return breakpoints[subject.value].width > breakpoints[size].width;
    }
  } as const;

  // 仅在浏览器环境下才需要监听断点变化
  if (isServer) return [subject, methods, () => {}] as const;

  const match = {
    sm: window.matchMedia(`(max-width: ${breakpoints.md.width}px)`),
    md: window.matchMedia(
      `(min-width: ${breakpoints.md.width}px) and (max-width: ${breakpoints.lg.width}px)`
    ),
    lg: window.matchMedia(
      `(min-width: ${breakpoints.lg.width}px) and (max-width: ${breakpoints.xlg.width}px)`
    ),
    xlg: window.matchMedia(
      `(min-width: ${breakpoints.xlg.width}px) and (max-width: ${breakpoints.max.width}px)`
    ),
    max: window.matchMedia(`(min-width: ${breakpoints.max.width}px)`)
  } as const;
  const matchers = Object.entries(match) as Array<[Breakpoint, MediaQueryList]>;
  const sizeByMedia = Object.fromEntries(
    matchers.map(([size, queryList]) => [queryList.media, size])
  ) as Record<MediaQueryList["media"], Breakpoint>;

  const size = matchers.find(([, queryList]) => queryList.matches)![0];
  subject.next(size);

  function handleChange({ matches, media }: MediaQueryListEvent) {
    const size = sizeByMedia[media];
    if (matches) subject.next(size);
  }

  matchers.forEach(([, queryList]) => queryList.addEventListener("change", handleChange));

  return [
    subject,
    methods,
    () => matchers.forEach(([, queryList]) => queryList.removeEventListener("change", handleChange))
  ] as const;
}

function checkSizeValid(size: Breakpoint) {
  if (!notUAN(breakpoints[size])) throw new Error(`"${size}" is not a valid breakpoint size.`);
}

const [subject, { smallerThan, largerThan }] = observe();

export const breakpointObservable = subject.asObservable();

export function breakpoint() {
  return subject.value;
}

export { smallerThan, largerThan };
