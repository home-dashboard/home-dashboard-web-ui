import "./styles.scss";

import "@carbon/web-components/es/index.js";
import "@carbon/web-components/es/components/select/index.js";
import "@carbon/web-components/es/components/ui-shell/index.js";
import "@carbon/web-components/es/components/form/index.js";
import "@carbon/web-components/es/components/modal/index.js";

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

import type { CSSResult } from "lit";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TileCSSResult from "@carbon/web-components/es/components/tile/tile.css.js";
const tileCSSRules = ((TileCSSResult as CSSResult).styleSheet?.cssRules ??
  []) as Array<CSSStyleRule>;
Array.from(tileCSSRules).forEach((rule) => {
  if (rule.selectorText === ".cds--tile, :host(cds-expandable-tile), :host(cds-tile)") {
    rule.style.minWidth = "auto";
    rule.style.minHeight = "auto";
  } else if (rule.selectorText === ".cds--link__icon") {
    rule.style.marginLeft = "0";
  } else if (rule.selectorText === ":host(cds-clickable-tile) .cds--tile--clickable") {
    rule.style.width = "100%";
    rule.style.overflow = "hidden";
  }
});

(function modifyTooltipCSSRule(): void {
  const el = document.createElement("cds-tooltip");
  el.innerHTML = "<span /><cds-tooltip-content/>";
  document.body.appendChild(el);

  const tooltipCSSRules = Array.from(
    el.shadowRoot?.adoptedStyleSheets[0].cssRules ?? []
  ) as Array<CSSStyleRule>;

  tooltipCSSRules.forEach((rule) => {
    if (rule.selectorText === ".cds--tooltip") {
      rule.style.width = "100%";
    }
  });

  document.body.removeChild(el);
})();
