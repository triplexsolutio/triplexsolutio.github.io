const TEMPLATE_URL = new URL("./planetInfo.html", import.meta.url).href;

export class PlanetInfo {
  constructor({ host }) {
    this.host = host;
    this.templateUrl = TEMPLATE_URL;
    this.ready = this.init();
  }

  async init() {
    const html = await fetch(this.templateUrl).then((r) => r.text());
    this.host.innerHTML = html;

    this.el = this.host.querySelector(".planet-info");
    this.titleEl = this.host.querySelector('[data-role="title"]');
    this.subtitleEl = this.host.querySelector('[data-role="subtitle"]');
    this.descEl = this.host.querySelector('[data-role="description"]');
    // this.tagsEl = this.host.querySelector('[data-role="tags"]');
    this.actionsEl = this.host.querySelector('[data-role="actions"]');
    // this.typeChipEl = this.host.querySelector('[data-role="node-type"]');
    this.backBtn = this.host.querySelector('[data-action="go-back"]');
  }

  update({ node, canGoBack }) {
    const apply = () => {
      if (!this.el) return;

      this.el.classList.add("planet-info--loading");

      this.titleEl.textContent = node.title || "";
      this.subtitleEl.textContent = node.subtitle || "";
      this.subtitleEl.style.display = node.subtitle ? "" : "none";

      this.descEl.textContent = node.description || "";
      this.descEl.style.display = node.description ? "" : "none";

      const typeLabel =
        node.type || (node.children?.length ? "Planeta" : "Satélite");
      // this.typeChipEl.textContent = typeLabel;

      // Tags
      // this.tagsEl.innerHTML = "";
      // if (Array.isArray(node.tags)) {
      //   node.tags.forEach((tag) => {
      //     const el = document.createElement("span");
      //     el.className = "planet-info__tag";
      //     el.textContent = tag;
      //     this.tagsEl.appendChild(el);
      //   });
      // }

      // Acciones
      this.actionsEl.innerHTML = "";
      if (Array.isArray(node.actions)) {
        node.actions.forEach((action) => {
          const a = document.createElement("a");
          a.className = "planet-info__action-btn";
          a.href = action.href || "#";
          a.target = action.external ? "_blank" : "_self";
          a.rel = "noopener noreferrer";
          a.textContent = action.label;
          this.actionsEl.appendChild(a);
        });
      }

      if (this.backBtn) {
        this.backBtn.style.visibility = canGoBack ? "visible" : "hidden";
      }

      this.el.classList.remove("planet-info--loading");
    };

    if (this.ready instanceof Promise) {
      this.ready.then(apply);
    } else {
      apply();
    }
  }
}
