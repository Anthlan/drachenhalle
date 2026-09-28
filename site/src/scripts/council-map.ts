type MapRegion = {
  id: number;
  code: string;
  name: string;
  color: string;
  note: string;
  center: { pixelX: number; pixelY: number; x: number; y: number };
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

const parseHexColor = (value: string) => {
  const hex = value.replace("#", "");
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
};

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
  const overlay = root.querySelector<HTMLCanvasElement>("[data-map-overlay]");
  const labels = root.querySelector<HTMLElement>("[data-map-labels]");
  const selection = root.querySelector<HTMLElement>("[data-map-selection]");
  const coordinates = root.querySelector<HTMLOutputElement>("[data-map-coordinates]");
  const layerToggle = root.querySelector<HTMLInputElement>("[data-map-layer]");
  if (!viewport || !stage || !overlay || !labels || !selection || !coordinates || !layerToggle) return;

  const regions = JSON.parse(root.dataset.regions || "[]") as MapRegion[];
  const regionsById = new Map(regions.map((region) => [region.id, region]));
  const context = overlay.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  let maskPixels: Uint8ClampedArray | null = null;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let selectedId = 0;
  let dragStart: { pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null = null;
  let movedDuringPointer = false;

  const stageSize = () => {
    const aspect = Number.parseFloat(getComputedStyle(root).getPropertyValue("--map-aspect")) || 1;
    const availableWidth = viewport.clientWidth;
    const availableHeight = viewport.clientHeight;
    if (availableWidth / availableHeight > aspect) {
      return { width: availableHeight * aspect, height: availableHeight };
    }
    return { width: availableWidth, height: availableWidth / aspect };
  };

  const constrainOffsets = () => {
    const width = stage.offsetWidth * scale;
    const height = stage.offsetHeight * scale;
    const minimumX = Math.min(0, viewport.clientWidth - width);
    const minimumY = Math.min(0, viewport.clientHeight - height);
    offsetX = width <= viewport.clientWidth ? (viewport.clientWidth - width) / 2 : clamp(offsetX, minimumX, 0);
    offsetY = height <= viewport.clientHeight ? (viewport.clientHeight - height) / 2 : clamp(offsetY, minimumY, 0);
  };

  const applyTransform = () => {
    constrainOffsets();
    stage.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    stage.style.setProperty("--inverse-map-scale", String(1 / scale));
    root.dataset.zoomed = scale > 1.08 ? "true" : "false";
  };

  const resetView = () => {
    const size = stageSize();
    stage.style.width = `${size.width}px`;
    stage.style.height = `${size.height}px`;
    scale = 1;
    offsetX = (viewport.clientWidth - size.width) / 2;
    offsetY = (viewport.clientHeight - size.height) / 2;
    applyTransform();
  };

  const zoomTo = (nextScale: number, clientX = viewport.getBoundingClientRect().left + viewport.clientWidth / 2, clientY = viewport.getBoundingClientRect().top + viewport.clientHeight / 2) => {
    const bounds = viewport.getBoundingClientRect();
    const pointX = clientX - bounds.left;
    const pointY = clientY - bounds.top;
    const mapX = (pointX - offsetX) / scale;
    const mapY = (pointY - offsetY) / scale;
    scale = clamp(nextScale, 1, 6);
    offsetX = pointX - mapX * scale;
    offsetY = pointY - mapY * scale;
    applyTransform();
  };

  const mapPointFromEvent = (clientX: number, clientY: number) => {
    const bounds = viewport.getBoundingClientRect();
    const x = (clientX - bounds.left - offsetX) / scale;
    const y = (clientY - bounds.top - offsetY) / scale;
    return {
      x,
      y,
      normalizedX: clamp(x / stage.offsetWidth, 0, 1),
      normalizedY: clamp(y / stage.offsetHeight, 0, 1),
    };
  };

  const updateCoordinates = (clientX: number, clientY: number) => {
    const point = mapPointFromEvent(clientX, clientY);
    const x = Math.round(1 + point.normalizedX * 998);
    const y = Math.round(1 + (1 - point.normalizedY) * 998);
    coordinates.value = `X ${x} · Y ${y}`;
  };

  const renderOverlay = () => {
    if (!maskPixels) return;
    const image = context.createImageData(overlay.width, overlay.height);
    const colors = new Map(regions.map((region) => [region.id, parseHexColor(region.color)]));
    for (let index = 0; index < overlay.width * overlay.height; index += 1) {
      const maskOffset = index * 4;
      const id = maskPixels[maskOffset] + (maskPixels[maskOffset + 1] << 8) + (maskPixels[maskOffset + 2] << 16);
      if (!id) continue;
      const color = colors.get(id);
      if (!color) continue;
      image.data[maskOffset] = color[0];
      image.data[maskOffset + 1] = color[1];
      image.data[maskOffset + 2] = color[2];
      image.data[maskOffset + 3] = id === selectedId ? 196 : 108;
    }
    context.putImageData(image, 0, 0);
  };

  const selectRegion = (id: number, updateHash = true) => {
    const region = regionsById.get(id);
    if (!region) return;
    selectedId = id;
    root.querySelectorAll<HTMLElement>("[data-map-region]").forEach((label) => {
      label.classList.toggle("is-selected", Number(label.dataset.mapRegion) === id);
    });
    selection.innerHTML = `
      <p class="map-selection-code">${escapeHtml(region.code)}</p>
      <h2>${escapeHtml(region.name)}</h2>
      <p class="map-selection-coordinate">Mittelpunkt: X ${region.center.x} · Y ${region.center.y}</p>
      ${region.note ? `<p>${escapeHtml(region.note)}</p>` : '<p class="map-selection-empty">Noch keine Planungsnotiz hinterlegt.</p>'}
    `;
    renderOverlay();
    if (updateHash) history.replaceState(null, "", `#${region.code}`);
  };

  const selectAtPoint = (clientX: number, clientY: number) => {
    if (!maskPixels) return;
    const point = mapPointFromEvent(clientX, clientY);
    const x = clamp(Math.floor(point.normalizedX * overlay.width), 0, overlay.width - 1);
    const y = clamp(Math.floor(point.normalizedY * overlay.height), 0, overlay.height - 1);
    const offset = (y * overlay.width + x) * 4;
    const id = maskPixels[offset] + (maskPixels[offset + 1] << 8) + (maskPixels[offset + 2] << 16);
    if (id) selectRegion(id);
  };

  const maskImage = new Image();
  maskImage.addEventListener("load", () => {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = overlay.width;
    maskCanvas.height = overlay.height;
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskContext) return;
    maskContext.drawImage(maskImage, 0, 0, overlay.width, overlay.height);
    maskPixels = maskContext.getImageData(0, 0, overlay.width, overlay.height).data;
    renderOverlay();
    const hashId = Number.parseInt(location.hash.replace(/^#G/i, ""), 10);
    if (regionsById.has(hashId)) selectRegion(hashId, false);
  });
  maskImage.src = root.dataset.maskUrl || "";

  root.querySelector("[data-map-zoom-in]")?.addEventListener("click", () => zoomTo(scale * 1.35));
  root.querySelector("[data-map-zoom-out]")?.addEventListener("click", () => zoomTo(scale / 1.35));
  root.querySelector("[data-map-reset]")?.addEventListener("click", resetView);
  layerToggle.addEventListener("change", () => {
    overlay.hidden = !layerToggle.checked;
    labels.hidden = !layerToggle.checked;
  });

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomTo(scale * (event.deltaY < 0 ? 1.16 : 1 / 1.16), event.clientX, event.clientY);
  }, { passive: false });

  viewport.addEventListener("pointerdown", (event) => {
    if ((event.target as HTMLElement).closest("[data-map-region]")) return;
    viewport.setPointerCapture(event.pointerId);
    dragStart = { pointerX: event.clientX, pointerY: event.clientY, offsetX, offsetY };
    movedDuringPointer = false;
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", (event) => {
    updateCoordinates(event.clientX, event.clientY);
    if (!dragStart) return;
    const deltaX = event.clientX - dragStart.pointerX;
    const deltaY = event.clientY - dragStart.pointerY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) movedDuringPointer = true;
    offsetX = dragStart.offsetX + deltaX;
    offsetY = dragStart.offsetY + deltaY;
    applyTransform();
  });
  const finishPointer = (event: PointerEvent) => {
    if (dragStart && !movedDuringPointer) selectAtPoint(event.clientX, event.clientY);
    dragStart = null;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", finishPointer);
  viewport.addEventListener("pointercancel", finishPointer);

  viewport.addEventListener("keydown", (event) => {
    const movement = 60;
    if (event.key === "+" || event.key === "=") zoomTo(scale * 1.25);
    else if (event.key === "-") zoomTo(scale / 1.25);
    else if (event.key === "Home" || event.key === "0") resetView();
    else if (event.key === "ArrowLeft") offsetX += movement;
    else if (event.key === "ArrowRight") offsetX -= movement;
    else if (event.key === "ArrowUp") offsetY += movement;
    else if (event.key === "ArrowDown") offsetY -= movement;
    else return;
    event.preventDefault();
    applyTransform();
  });

  root.querySelectorAll<HTMLElement>("[data-map-region]").forEach((label) => {
    label.addEventListener("click", () => selectRegion(Number(label.dataset.mapRegion)));
  });

  new ResizeObserver(resetView).observe(viewport);
  resetView();
}
