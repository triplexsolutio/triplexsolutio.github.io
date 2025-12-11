// elements/modal.js
const templateCache = new Map();
const DEFAULT_SRC = new URL("./modal.html", import.meta.url).href;

class ModalElement extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  async connectedCallback() {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: "open" });
    const attr = this.getAttribute("src");
    const src = attr ? new URL(attr, document.baseURI).href : DEFAULT_SRC;

    try {
      const html = templateCache.has(src)
        ? templateCache.get(src)
        : await fetch(src, { cache: "no-store" }).then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
          });

      templateCache.set(src, html);
      root.innerHTML = html;

      this.dialog = root.querySelector(".dialog");
      this.backdrop = root.querySelector(".backdrop");
      this.closeButton = root.querySelector(".close");

      this.syncOpenState(this.hasAttribute("open"));

      this.backdrop?.addEventListener("click", this.handleBackdropClick);
      this.closeButton?.addEventListener("click", this.handleCloseClick);
      document.addEventListener("keydown", this.handleKeydown);
    } catch (error) {
      console.error("[modal-element]", error);
      const fallback = document.createElement("div");
      fallback.setAttribute("part", "error");
      fallback.style.cssText =
        "padding:12px;border:1px solid #b91c1c;border-radius:8px;background:#fef2f2;color:#7f1d1d";
      fallback.textContent = `No se pudo cargar el modal (${error.message}).`;
      root.innerHTML = "";
      root.appendChild(fallback);
    }
  }

  disconnectedCallback() {
    this.backdrop?.removeEventListener("click", this.handleBackdropClick);
    this.closeButton?.removeEventListener("click", this.handleCloseClick);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "open" && this.shadowRoot) {
      this.syncOpenState(newValue !== null);
    }
  }

  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }

  toggle(force) {
    const shouldOpen =
      typeof force === "boolean" ? force : !this.hasAttribute("open");
    if (shouldOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  handleBackdropClick() {
    if (this.dataset.backdrop !== "static") {
      this.close();
    }
  }

  handleCloseClick() {
    this.close();
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.hasAttribute("open")) {
      this.close();
    }
  }

  syncOpenState(isOpen) {
    if (!this.dialog) return;

    this.dialog.setAttribute("aria-hidden", String(!isOpen));
    this.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      this.setAttribute("aria-live", "polite");
      this.focusTrap();
    } else {
      this.removeAttribute("aria-live");
    }
  }

  focusTrap() {
    if (!this.dialog) return;

    const focusableSelectors = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ];

    const focusable = this.dialog.querySelector(
      focusableSelectors.join(",")
    );

    if (focusable) {
      focusable.focus({ preventScroll: true });
    } else {
      this.closeButton?.focus({ preventScroll: true });
    }
  }
}

// Registrar el custom element estándar y alias legibles
customElements.define("ts-modal", ModalElement);
customElements.define("modal-element", ModalElement);

// Permitir usar la etiqueta <modal> reemplazándola por <ts-modal> con el mismo contenido
const upgradeLegacyModalTags = () => {
  document.querySelectorAll("modal").forEach((legacy) => {
    // Evitamos procesar un mismo nodo más de una vez
    if (legacy.dataset.upgradedModal === "1") return;

    const replacement = document.createElement("ts-modal");

    for (const attr of legacy.attributes) {
      replacement.setAttribute(attr.name, attr.value);
    }

    replacement.innerHTML = legacy.innerHTML;
    replacement.dataset.upgradedModal = "1";
    legacy.replaceWith(replacement);
  });
};

const ensureUpgradeWhenReady = () => {
  upgradeLegacyModalTags();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureUpgradeWhenReady, {
    once: true,
  });
} else {
  ensureUpgradeWhenReady();
}
