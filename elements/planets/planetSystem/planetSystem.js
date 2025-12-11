// planets/planetSystem/planetSystem.js
import { PlanetInfo } from "../planetInfo/planetInfo.js";
const TEMPLATE_URL = new URL("./planetSystem.html", import.meta.url).href;

export class PlanetSystem {
  constructor({ host, data }) {
    this.host = host;
    this.dataRoot = data;
    this.currentNodeId = data.id;
    this.history = [data.id];
    this.templateUrl = TEMPLATE_URL;
    this.infoComponent = null;

    this.init();
  }

  async init() {
    const html = await fetch(this.templateUrl).then((r) => r.text());
    this.host.innerHTML = html;

    this.rootEl = this.host.querySelector(".planet-system");

    this.spaceEl =
      this.host.querySelector(".planet-system__space") || this.rootEl;
    this.viewportEl =
      this.host.querySelector('[data-role="viewport"]') ||
      this.host.querySelector(".planet-system__center-layer");

    this.zoom = 1;
    this.minZoom = 0.65;
    this.maxZoom = 1.6;
    this.panX = 0;
    this.panY = 0;

    // Busco primero por data-role y, si no existe, por clase
    this.centerLayer =
      this.host.querySelector('[data-role="center-layer"]') ||
      this.host.querySelector(".planet-system__center-layer");

    this.orbitsLayer =
      this.host.querySelector('[data-role="orbits-layer"]') ||
      this.host.querySelector(".planet-system__orbits-layer");

    const infoHost = this.host.querySelector(
      '[data-component-root="planet-info"]'
    );
    if (infoHost) {
      this.infoComponent = new PlanetInfo({ host: infoHost });
    }

    if (!this.centerLayer || !this.orbitsLayer) {
      console.warn(
        "[PlanetSystem] No se encontraron centerLayer/orbitsLayer. Revisa planetSystem.html"
      );
    }

    this.bindEvents();
    this.render();
    this.initZoomAndPanControls();
  }

  bindEvents() {
    // Clics sobre planetas / satélites
    this.rootEl.addEventListener("click", (event) => {
      const planetEl = event.target.closest("[data-node-id]");
      if (!planetEl) return;

      const nodeId = planetEl.dataset.nodeId;
      if (!nodeId) return;

      this.focusNode(nodeId);
    });

    // Botón atrás del panel de info
    this.rootEl.addEventListener("click", (event) => {
      const backBtn = event.target.closest('[data-action="go-back"]');
      if (!backBtn) return;
      this.goBack();
    });
  }

  /* ---------- BÚSQUEDA EN EL ÁRBOL ---------- */

  findNodeById(id, node = this.dataRoot, parentId = null) {
    if (node.id === id) {
      return { node, parentId };
    }
    if (!node.children) return null;

    for (const child of node.children) {
      const res = this.findNodeById(id, child, node.id);
      if (res) return res;
    }
    return null;
  }

  getCurrentNode() {
    const found = this.findNodeById(this.currentNodeId);
    return found?.node ?? this.dataRoot;
  }

  getParentIdOf(id) {
    const found = this.findNodeById(id);
    return found?.parentId ?? null;
  }

  /* ---------- NAVEGACIÓN ---------- */

  focusNode(id) {
    if (id === this.currentNodeId) return;
    const found = this.findNodeById(id);
    if (!found) return;

    this.currentNodeId = id;
    this.history.push(id);

    this.triggerTransition();
    this.render();
  }

  goBack() {
    if (this.history.length <= 1) return;
    this.history.pop();
    const previousId = this.history[this.history.length - 1];
    this.currentNodeId = previousId;
    this.triggerTransition();
    this.render();
  }

  triggerTransition() {
    if (!this.rootEl) return;
    this.rootEl.classList.remove("planet-system--enter");
    void this.rootEl.offsetWidth; // reflow
    this.rootEl.classList.add("planet-system--enter");
  }

  /* ---------- RENDER ---------- */

  render() {
    if (!this.centerLayer || !this.orbitsLayer) return;

    const current = this.getCurrentNode();
    const parentId = this.getParentIdOf(current.id);

    // Info panel
    if (this.infoComponent) {
      this.infoComponent.update({
        node: current,
        canGoBack: !!parentId,
      });
    }

    // Centro
    this.centerLayer.innerHTML = "";
    const centerPlanet = this.createPlanetElement(current, {
      variant: "center",
    });
    this.centerLayer.appendChild(centerPlanet);

    // Órbitas
    this.orbitsLayer.innerHTML = "";

    const children = Array.isArray(current.children) ? current.children : [];
    if (!children.length) {
      console.log("[PlanetSystem] Nodo sin hijos:", current.id);
      return;
    }

    const orbit = this.createOrbitElement({
      nodes: children,
      level: 1,
      radius: 150,
      duration: 42,
    });

    this.orbitsLayer.appendChild(orbit);
  }

  createOrbitElement({ nodes, level, radius, duration }) {
    const orbit = document.createElement("div");
    orbit.className = "orbit orbit--level-" + level;
    orbit.style.setProperty("--orbit-radius", radius + "px");
    orbit.style.setProperty("--orbit-duration", duration + "s");

    const angleStep = 360 / nodes.length;

    nodes.forEach((node, index) => {
      const planet = this.createPlanetElement(node, {
        variant: "orbit",
        angle: angleStep * index,
        level,
      });
      orbit.appendChild(planet);
    });

    return orbit;
  }

  createPlanetElement(node, options = {}) {
    const { variant = "orbit", angle = 0, level = 1 } = options;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "planet planet--" + variant;
    button.dataset.nodeId = node.id;

    if (node.id === "root" && variant === "center") {
      button.classList.add("planet--root");
    }

    if (variant === "orbit") {
      button.style.setProperty("--planet-angle", angle + "deg");
      button.style.setProperty("--planet-level", String(level));
    }

    // Cuerpo (círculo)
    const body = document.createElement("div");
    body.className = "planet__body";

    const glow = document.createElement("div");
    glow.className = "planet__glow";
    body.appendChild(glow);

    const hasLogoImage = !!node.logoImage;

    // Logo dentro del círculo
    if (hasLogoImage) {
      const img = document.createElement("img");
      img.className = "planet__logo-img";
      img.src = node.logoImage;
      img.alt = node.title || "logo";
      body.appendChild(img);
    } else {
      const logo = document.createElement("div");
      logo.className = "planet__logo";
      logo.textContent = node.logoText || node.title?.charAt(0) || "";
      body.appendChild(logo);
    }

    // solo el círculo dentro del body
    button.appendChild(body);

    // Título y subtítulo FUERA del círculo, debajo
    if (node.title) {
      const title = document.createElement("div");
      title.className = hasLogoImage
        ? "planet__title planet__title--below-logo"
        : "planet__title";
      title.textContent = node.title;
      button.appendChild(title);
    }

    if (node.subtitle && variant === "center") {
      const subtitle = document.createElement("div");
      subtitle.className = "planet__subtitle";
      subtitle.textContent = node.subtitle;
      button.appendChild(subtitle);
    }

    // Satélites (si tiene hijos y NO es el centro)
    const hasSatellites =
      Array.isArray(node.children) &&
      node.children.length > 0 &&
      variant === "orbit";

    if (hasSatellites) {
      const satellitesOrbit = document.createElement("div");
      satellitesOrbit.className = "orbit orbit--satellites";
      satellitesOrbit.style.setProperty("--orbit-radius", "52px");
      satellitesOrbit.style.setProperty("--orbit-duration", "24s");

      const maxSatellites = 6;
      const slice = node.children.slice(0, maxSatellites);
      const angleStep = 360 / slice.length;

      slice.forEach((child, index) => {
        const satellite = document.createElement("button");
        satellite.type = "button";
        satellite.className = "planet planet--satellite";
        satellite.dataset.nodeId = child.id;
        satellite.style.setProperty(
          "--planet-angle",
          angleStep * index + "deg"
        );

        const satBody = document.createElement("div");
        satBody.className = "planet__body planet__body--satellite";

        if (child.logoImage) {
          const satImg = document.createElement("img");
          satImg.className = "planet__logo-img planet__logo-img--satellite";
          satImg.src = child.logoImage;
          satImg.alt = child.title || "logo";
          satBody.appendChild(satImg);
        } else {
          const satLogo = document.createElement("div");
          satLogo.className = "planet__logo planet__logo--satellite";
          satLogo.textContent = child.logoText || child.title?.charAt(0) || "";
          satBody.appendChild(satLogo);
        }

        satellite.appendChild(satBody);

        // título del satélite también fuera del círculo
        if (child.title) {
          const satTitle = document.createElement("div");
          satTitle.className =
            "planet__title planet__title--satellite-below-logo";
          satTitle.textContent = child.title;
          satellite.appendChild(satTitle);
        }

        satellitesOrbit.appendChild(satellite);
      });

      button.appendChild(satellitesOrbit);
    }

    // Color de acento
    const accent = this.getAccentColor(node.accent);
    if (accent) {
      button.style.setProperty("--planet-accent", accent);
    }

    return button;
  }

  getAccentColor(accentKey) {
    if (!accentKey) return null;
    switch (accentKey) {
      case "blue":
        return "var(--accent-blue)";
      case "orange":
        return "var(--accent-orange)";
      default:
        return null;
    }
  }
  /* ---------- ZOOM & PAN ---------- */

  setZoom(nextZoom) {
    const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, nextZoom));
    this.zoom = clamped;
    this.applyTransform();
  }

  adjustZoom(delta) {
    this.setZoom(this.zoom + delta);
  }

  applyTransform() {
    if (!this.viewportEl) return;
    this.viewportEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  initZoomAndPanControls() {
    if (!this.spaceEl) return;

    const zoomInBtn = this.host.querySelector("[data-zoom-in]");
    const zoomOutBtn = this.host.querySelector("[data-zoom-out]");
    const zoomResetBtn = this.host.querySelector("[data-zoom-reset]");

    zoomInBtn?.addEventListener("click", () => {
      this.adjustZoom(0.15);
    });

    zoomOutBtn?.addEventListener("click", () => {
      this.adjustZoom(-0.15);
    });

    zoomResetBtn?.addEventListener("click", () => {
      this.resetView();
    });

    // --- Pan con ratón y touch (click y arrastrar) ---
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    const startPan = (clientX, clientY, target) => {
      if (target.closest && target.closest(".planet")) return; // no empezar pan si se pulsa un planeta
      isPanning = true;
      startX = clientX;
      startY = clientY;
      originX = this.panX;
      originY = this.panY;
      this.spaceEl.classList.add("planet-system__space--panning");
    };

    const movePan = (clientX, clientY) => {
      if (!isPanning) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      this.panX = originX + dx;
      this.panY = originY + dy;
      this.applyTransform();
    };

    const endPan = () => {
      if (!isPanning) return;
      isPanning = false;
      this.spaceEl.classList.remove("planet-system__space--panning");
    };

    // Ratón
    this.spaceEl.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return; // solo botón izquierdo
      event.preventDefault();
      startPan(event.clientX, event.clientY, event.target);
    });

    window.addEventListener("mousemove", (event) => {
      movePan(event.clientX, event.clientY);
    });

    window.addEventListener("mouseup", () => {
      endPan();
    });

    // Touch
    this.spaceEl.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        startPan(touch.clientX, touch.clientY, event.target);
      },
      { passive: false }
    );

    this.spaceEl.addEventListener(
      "touchmove",
      (event) => {
        if (!isPanning || event.touches.length !== 1) return;
        event.preventDefault();
        const touch = event.touches[0];
        movePan(touch.clientX, touch.clientY);
      },
      { passive: false }
    );

    this.spaceEl.addEventListener("touchend", () => {
      endPan();
    });

    this.spaceEl.addEventListener("touchcancel", () => {
      endPan();
    });

    // Aplicar estado inicial
    this.applyTransform();
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
  }
}
