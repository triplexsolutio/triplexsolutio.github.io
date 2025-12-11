// elements/planetBubble.js
import { planetTree } from "../data/planetTree.js";

const TEMPLATE_URL = new URL("./planetBubble.html", import.meta.url).href;
const templateCache = new Map();
const MODAL_ID = "planetBubbleModal";

const findNodeById = (id, node = planetTree) => {
  if (!id || !node) return null;
  if (node.id === id) return node;
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) {
    const found = findNodeById(id, child);
    if (found) return found;
  }
  return null;
};

class PlanetBubble extends HTMLElement {
  static get observedAttributes() {
    return ["node-id"];
  }

  constructor() {
    super();
    this.nodeData = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  async connectedCallback() {
    if (this.shadowRoot) return;

    const html =
      templateCache.get(TEMPLATE_URL) ||
      (await fetch(TEMPLATE_URL).then((r) => r.text()));
    templateCache.set(TEMPLATE_URL, html);

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = html;

    this.bubbleEl = root.querySelector(".bubble");
    this.imageEl = root.querySelector(".bubble__img");
    this.fallbackEl = root.querySelector(".bubble__fallback");
    this.titleEl = root.querySelector(".bubble__title");

    this.syncNode();

    this.bubbleEl?.addEventListener("click", this.handleClick);
    this.bubbleEl?.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.bubbleEl?.removeEventListener("click", this.handleClick);
    this.bubbleEl?.removeEventListener("keydown", this.handleKeydown);
  }

  attributeChangedCallback(name, _old, _value) {
    if (name === "node-id") {
      this.syncNode();
    }
  }

  syncNode() {
    const nodeId = this.getAttribute("node-id");
    const node = findNodeById(nodeId);
    this.nodeData = node;

    if (!node || !this.titleEl || !this.imageEl || !this.fallbackEl) return;

    const accent = this.getAccentColor(node.accent);
    if (accent) {
      this.style.setProperty("--bubble-accent", accent);
    }

    this.titleEl.textContent = node.title || node.id;

    const hasLogoImage = Boolean(node.logoImage);
    if (hasLogoImage) {
      this.imageEl.src = node.logoImage;
      this.imageEl.alt = node.title || "logo";
      this.imageEl.style.display = "block";
      this.fallbackEl.style.display = "none";
    } else {
      this.imageEl.removeAttribute("src");
      this.imageEl.style.display = "none";
      this.fallbackEl.style.display = "grid";
      this.fallbackEl.textContent =
        node.logoText || node.title?.slice(0, 3)?.toUpperCase() || "?";
    }
  }

  handleClick() {
    if (!this.nodeData) return;
    this.openModalWithNode(this.nodeData);
  }

  handleKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleClick();
    }
  }

  openModalWithNode(node) {
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement("ts-modal");
      modal.id = MODAL_ID;
      modal.style.setProperty("--modal-max-width", "720px");
      modal.style.setProperty("--modal-padding", "1.25rem 1.35rem 1.4rem");
      document.body.appendChild(modal);
    }

    const tags = (node.tags || []).map((t) => `<span class="badge">${t}</span>`).join("");
    const actions = (node.actions || [])
      .map(
        (action) => `
        <a class="btn btn-outline" href="${action.href}" ${
          action.external ? 'target="_blank" rel="noopener"' : ""
        }>
          ${action.label}
        </a>`
      )
      .join("");

    modal.innerHTML = `
      <style>
        .pb-modal {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          color: var(--text, #e5e7eb);
        }
        .pb-modal__header {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.8rem;
          align-items: center;
        }
        .pb-modal__thumb {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
          display: grid;
          place-items: center;
          box-shadow: inset 0 10px 18px rgba(255,255,255,0.18), inset 0 -8px 14px rgba(0,0,0,0.2), 0 12px 24px rgba(0,0,0,0.35);
          overflow: hidden;
        }
        .pb-modal__thumb img, .pb-modal__thumb span {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #0b1224;
          background: rgba(255,255,255,0.75);
        }
        .pb-modal__kicker {
          margin: 0;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted, #9ca3af);
        }
        .pb-modal__title {
          margin: 0.05rem 0 0.1rem;
          font-size: 1.2rem;
        }
        .pb-modal__subtitle {
          margin: 0;
          color: var(--muted, #9ca3af);
        }
        .pb-modal__description {
          margin: 0;
          color: var(--muted, #9ca3af);
          line-height: 1.6;
        }
        .pb-modal__section h4 {
          margin: 0 0 0.4rem;
          font-size: 0.95rem;
        }
        .pb-modal__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .pb-modal__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .pb-modal .badge {
          display: inline-block;
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          background: var(--accent2-soft, rgba(255,255,255,0.12));
          color: var(--text, #e5e7eb);
          border: 1px solid rgba(255,255,255,0.12);
          font-weight: 600;
          font-size: 0.8rem;
        }
      </style>
      <div class="pb-modal">
        <div class="pb-modal__header">
          <div class="pb-modal__thumb">
            ${
              node.logoImage
                ? `<img src="${node.logoImage}" alt="${node.title || "logo"}" />`
                : `<span>${node.logoText || node.title?.charAt(0) || "?"}</span>`
            }
          </div>
          <div>
            <p class="pb-modal__kicker">${node.type || "Nodo"}</p>
            <h3 class="pb-modal__title">${node.title || node.id}</h3>
            ${node.subtitle ? `<p class="pb-modal__subtitle">${node.subtitle}</p>` : ""}
          </div>
        </div>
        ${
          node.description
            ? `<p class="pb-modal__description">${node.description}</p>`
            : ""
        }
        ${
          tags
            ? `<div class="pb-modal__section">
                <h4>Tags</h4>
                <div class="pb-modal__tags">${tags}</div>
              </div>`
            : ""
        }
        ${
          actions
            ? `<div class="pb-modal__section">
                <div class="pb-modal__actions">${actions}</div>
              </div>`
            : ""
        }
      </div>
    `;

    modal.setAttribute("open", "");
  }

  getAccentColor(accentKey) {
    if (!accentKey) return null;
    switch (accentKey) {
      case "blue":
        return "var(--accent-blue, #38bdf8)";
      case "orange":
        return "var(--accent-orange, #fb923c)";
      default:
        return null;
    }
  }
}

customElements.define("planet-bubble", PlanetBubble);
