type MapRegion = {
  id: number;
  code: string;
  cityLevel: string;
  center: { vectorX: number; vectorY: number; x: number; y: number };
};

const worldSize = 1000;
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
})[character] || character);

export function initializeCouncilMap() {
  const root = document.querySelector<HTMLElement>("[data-council-map]");
  if (!root) return;

  const viewport = root.querySelector<HTMLElement>("[data-map-viewport]");
  const stage = root.querySelector<HTMLElement>("[data-map-stage]");
  const vector = root.querySelector<SVGSVGElement>("[data-map-vector]");
  const vectorRegions = root.querySelector<SVGGElement>("[data-map-regions]");
  const selection = root.querySelector<HTMLElement>("[data-map-selection]");
  const coordinates = root.querySelector<HTMLOutputElement>("[data-map-coordinates]");
  const layerToggle = root.querySelector<HTMLInputElement>("[data-map-layer]");
  if (!viewport || !stage || !vector || !vectorRegions || !selection || !coordinates || !layerToggle) return;

  const regions = JSON.parse(root.dataset.regions || "[]") as MapRegion[];
  const regionsById = new Map(regions.map((region) => [region.id, region]));
  let scale = 1;
  let viewX = 0;
  let viewY = 0;
  let dragStart: { pointerX: number; pointerY: number; viewX: number; viewY: number } | null = null;
  let movedDuringPointer = false;

  const visibleWorldSize = () => worldSize / scale;

  const stageSize = () => {
    const aspect = Number.parseFloat(getComputedStyle(root).getPropertyValue("--map-aspect")) || 1;
    const availableWidth = viewport.clientWidth;
    const availableHeight = viewport.clientHeight;
    if (availableWidth / availableHeight > aspect) {
      return { width: availableHeight * aspect, height: availableHeight };
    }
    return { width: availableWidth, height: availableWidth / aspect };
  };

  const updateStageSize = () => {
    const size = stageSize();
    stage.style.width = `${size.width}px`;
    stage.style.height = `${size.height}px`;
    stage.style.left = `${(viewport.clientWidth - size.width) / 2}px`;
    stage.style.top = `${(viewport.clientHeight - size.height) / 2}px`;
  };

  const constrainView = () => {
    const visible = visibleWorldSize();
    viewX = clamp(viewX, 0, worldSize - visible);
    viewY = clamp(viewY, 0, worldSize - visible);
  };

  const applyView = () => {
    constrainView();
    const visible = visibleWorldSize();
    vector.setAttribute("viewBox", `${viewX} ${viewY} ${visible} ${visible}`);
    root.dataset.zoomed = scale > 1 ? "true" : "false";
    root.dataset.gridDetail = scale >= 2 ? "true" : "false";
  };

  const resetView = () => {
    scale = 1;
    viewX = 0;
    viewY = 0;
    updateStageSize();
    applyView();
  };

  const worldPointFromClient = (clientX: number, clientY: number) => {
    const bounds = vector.getBoundingClientRect();
    const visible = visibleWorldSize();
    return {
      x: viewX + clamp((clientX - bounds.left) / bounds.width, 0, 1) * visible,
      y: viewY + clamp((clientY - bounds.top) / bounds.height, 0, 1) * visible,
      fractionX: clamp((clientX - bounds.left) / bounds.width, 0, 1),
      fractionY: clamp((clientY - bounds.top) / bounds.height, 0, 1),
    };
  };

  const zoomTo = (
    nextScale: number,
    clientX = vector.getBoundingClientRect().left + vector.clientWidth / 2,
    clientY = vector.getBoundingClientRect().top + vector.clientHeight / 2,
  ) => {
    const focus = worldPointFromClient(clientX, clientY);
    scale = clamp(nextScale, 1, 8);
    const visible = visibleWorldSize();
    viewX = focus.x - focus.fractionX * visible;
    viewY = focus.y - focus.fractionY * visible;
    applyView();
  };

  const updateCoordinates = (clientX: number, clientY: number) => {
    const point = worldPointFromClient(clientX, clientY);
    const x = Math.round(clamp(point.x, 1, 999));
    const y = Math.round(clamp(worldSize - point.y, 1, 999));
    coordinates.value = `X ${x} · Y ${y}`;
  };

  const selectRegion = (id: number, updateHash = true) => {
    const region = regionsById.get(id);
    if (!region) return;
    root.querySelectorAll<Element>("[data-map-region], [data-map-region-shape]").forEach((element) => {
      const htmlElement = element as HTMLElement;
      const elementId = Number(htmlElement.dataset.mapRegion || htmlElement.dataset.mapRegionShape);
      element.classList.toggle("is-selected", elementId === id);
    });
    selection.innerHTML = `
      <p class="map-selection-code">${escapeHtml(region.code)}</p>
      <h2>Stadtlevel ${escapeHtml(region.cityLevel)}</h2>
      <p class="map-selection-coordinate">Mittelpunkt: X ${region.center.x} · Y ${region.center.y}</p>
    `;
    if (updateHash) history.replaceState(null, "", `#${region.code}`);
  };

  const regionIdAtPoint = (clientX: number, clientY: number) => {
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement | SVGElement | null;
    const element = target?.closest<HTMLElement>("[data-map-region], [data-map-region-shape]");
    return Number(element?.dataset.mapRegion || element?.dataset.mapRegionShape || 0);
  };

  root.querySelector("[data-map-zoom-in]")?.addEventListener("click", () => zoomTo(scale * 2));
  root.querySelector("[data-map-zoom-out]")?.addEventListener("click", () => zoomTo(scale / 2));
  root.querySelector("[data-map-reset]")?.addEventListener("click", resetView);
  layerToggle.addEventListener("change", () => {
    vectorRegions.classList.toggle("is-hidden", !layerToggle.checked);
  });

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomTo(scale * (event.deltaY < 0 ? 1.5 : 1 / 1.5), event.clientX, event.clientY);
  }, { passive: false });

  viewport.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).closest("[data-map-region]")) return;
    viewport.setPointerCapture(event.pointerId);
    dragStart = { pointerX: event.clientX, pointerY: event.clientY, viewX, viewY };
    movedDuringPointer = false;
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", (event) => {
    updateCoordinates(event.clientX, event.clientY);
    if (!dragStart) return;
    const bounds = vector.getBoundingClientRect();
    const visible = visibleWorldSize();
    const deltaX = event.clientX - dragStart.pointerX;
    const deltaY = event.clientY - dragStart.pointerY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) movedDuringPointer = true;
    viewX = dragStart.viewX - (deltaX / bounds.width) * visible;
    viewY = dragStart.viewY - (deltaY / bounds.height) * visible;
    applyView();
  });
  const finishPointer = (event: PointerEvent) => {
    if (dragStart && !movedDuringPointer) {
      const id = regionIdAtPoint(event.clientX, event.clientY);
      if (id) selectRegion(id);
    }
    dragStart = null;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", finishPointer);
  viewport.addEventListener("pointercancel", finishPointer);

  viewport.addEventListener("keydown", (event) => {
    const movement = 70 / scale;
    if (event.key === "+" || event.key === "=") zoomTo(scale * 2);
    else if (event.key === "-") zoomTo(scale / 2);
    else if (event.key === "Home" || event.key === "0") resetView();
    else if (event.key === "ArrowLeft") viewX -= movement;
    else if (event.key === "ArrowRight") viewX += movement;
    else if (event.key === "ArrowUp") viewY -= movement;
    else if (event.key === "ArrowDown") viewY += movement;
    else return;
    event.preventDefault();
    applyView();
  });

  root.querySelectorAll<SVGElement>("[data-map-region]").forEach((marker) => {
    marker.addEventListener("click", () => selectRegion(Number(marker.dataset.mapRegion)));
    marker.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectRegion(Number(marker.dataset.mapRegion));
    });
  });

  const hashId = Number.parseInt(location.hash.replace(/^#G/i, ""), 10);
  if (regionsById.has(hashId)) selectRegion(hashId, false);

  let previousViewportWidth = viewport.clientWidth;
  let previousViewportHeight = viewport.clientHeight;
  new ResizeObserver(() => {
    if (viewport.clientWidth === previousViewportWidth && viewport.clientHeight === previousViewportHeight) return;
    previousViewportWidth = viewport.clientWidth;
    previousViewportHeight = viewport.clientHeight;
    updateStageSize();
  }).observe(viewport);
  resetView();
}
