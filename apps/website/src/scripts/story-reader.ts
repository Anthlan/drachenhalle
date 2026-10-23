import {translateClient} from "../i18n/client";

export function initializeStoryReader() {
  const book = document.querySelector<HTMLElement>(".story-book");
  if (!book) return;
  const pages = Array.from(book.querySelectorAll<HTMLElement>(".story-page"));
  const toolbar = book.querySelector<HTMLElement>(".reader-toolbar")!;
  const help = book.querySelector<HTMLElement>(".reader-help")!;
  const previous = book.querySelector<HTMLButtonElement>("[data-reader-prev]")!;
  const next = book.querySelector<HTMLButtonElement>("[data-reader-next]")!;
  const position = book.querySelector<HTMLElement>("[data-reader-position]")!;
  const closeButton = book.querySelector<HTMLButtonElement>("[data-reader-close]")!;
  for (const [button, symbol] of [[previous, "‹"], [closeButton, "×"]] as const) {
    button.setAttribute("aria-label", button.textContent!.trim());
    button.title = button.textContent!.trim();
    button.textContent = symbol;
  }
  const start = document.querySelector<HTMLAnchorElement>("[data-start-reader]")!;
  const placeholder = document.createComment("Comic-Reader");
  book.before(placeholder);
  const dialog = document.createElement("dialog");
  dialog.className = "story-reader-dialog";
  dialog.setAttribute("aria-label", document.querySelector("h1")?.textContent || book.getAttribute("aria-label")!);
  document.body.append(dialog);
  let active = false;
  let current = 0;
  let zoomed: HTMLAnchorElement | undefined;
  let suppressClick = false;
  let scale = 1;
  const zoomControls = document.createElement("div");
  zoomControls.className = "reader-zoom-controls";
  const zoomPercent = document.createElement("span");
  zoomPercent.className = "reader-zoom-percent";
  zoomPercent.textContent = "100 %";
  const fitButton = document.createElement("button");
  fitButton.type = "button";
  fitButton.className = "reader-fit";
  fitButton.title = translateClient("Ganze Seite anzeigen");
  fitButton.setAttribute("aria-label", fitButton.title);
  fitButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><rect x="8" y="6" width="8" height="12" rx="1"/></svg>';
  fitButton.addEventListener("click", resetZoom);
  zoomControls.append(zoomPercent, fitButton);
  toolbar.append(zoomControls);

  function resetZoom() {
    if (!zoomed) return;
    zoomed.classList.remove("is-zoomed");
    zoomed.setAttribute("aria-pressed", "false");
    zoomed.querySelector("img")!.style.removeProperty("width");
    zoomed.querySelector("img")!.style.removeProperty("margin-top");
    scale = 1;
    zoomPercent.textContent = "100 %";
    zoomed.scrollTo(0, 0);
    zoomed = undefined;
  }

  function zoomAt(paper: HTMLAnchorElement, requested: number, clientX: number, clientY: number, fromX = clientX, fromY = clientY) {
    const image = paper.querySelector("img")!;
    const ratio = image.naturalWidth / image.naturalHeight;
    if (!ratio) return;
    const bounds = paper.getBoundingClientRect();
    const fit = Math.min(paper.clientWidth, paper.clientHeight * ratio);
    const oldWidth = fit * scale;
    const x = (fromX - bounds.left + paper.scrollLeft - Math.max(0, (paper.clientWidth - oldWidth) / 2)) / oldWidth;
    const y = (fromY - bounds.top + paper.scrollTop - Math.max(0, (paper.clientHeight - oldWidth / ratio) / 2)) / (oldWidth / ratio);
    const nextScale = Math.max(1, Math.min(6, requested));
    if (nextScale <= 1.001) { resetZoom(); return; }
    zoomed = paper;
    scale = nextScale;
    zoomPercent.textContent = `${Math.round(scale * 100)} %`;
    paper.classList.add("is-zoomed");
    paper.setAttribute("aria-pressed", "true");
    const width = fit * scale;
    image.style.width = width + "px";
    image.style.marginTop = Math.max(0, (paper.clientHeight - width / ratio) / 2) + "px";
    paper.scrollLeft = x * width + Math.max(0, (paper.clientWidth - width) / 2) - (clientX - bounds.left);
    paper.scrollTop = y * width / ratio + Math.max(0, (paper.clientHeight - width / ratio) / 2) - (clientY - bounds.top);
  }

  pages.forEach((page, index) => {
    const paper = page.querySelector<HTMLAnchorElement>(".story-paper")!;
    paper.removeAttribute("target");
    paper.setAttribute("role", "button");
    paper.setAttribute("aria-pressed", "false");
    paper.addEventListener("keydown", event => {
      if (event.key === " ") { event.preventDefault(); paper.click(); }
    });
    paper.addEventListener("click", event => {
      event.preventDefault();
      if (suppressClick) { suppressClick = false; return; }
      if (!active) { open(index); return; }
      if (zoomed) { resetZoom(); return; }
      const bounds = paper.getBoundingClientRect();
      zoomAt(paper, 2.5, event.detail ? event.clientX : bounds.left + bounds.width / 2,
        event.detail ? event.clientY : bounds.top + bounds.height / 2);
    });
    paper.addEventListener("wheel", event => {
      if (!active) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? paper.clientHeight : 1);
      zoomAt(paper, scale * Math.exp(-Math.max(-250, Math.min(250, delta)) * .002), event.clientX, event.clientY);
    }, {passive: false});
    let pinch: {distance: number; scale: number; x: number; y: number} | undefined;
    const midpoint = (touches: TouchList) => ({
      distance: Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY),
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });
    paper.addEventListener("touchstart", event => {
      if (!active || event.touches.length !== 2) return;
      pinch = {...midpoint(event.touches), scale};
      suppressClick = true;
      touch = undefined;
    }, {passive: true});
    paper.addEventListener("touchmove", event => {
      if (!active || !pinch || event.touches.length !== 2) return;
      event.preventDefault();
      const point = midpoint(event.touches);
      zoomAt(paper, pinch.scale * point.distance / Math.max(1, pinch.distance), point.x, point.y, pinch.x, pinch.y);
      pinch = {...point, scale};
      suppressClick = true;
    }, {passive: false});
    paper.addEventListener("touchend", event => {
      if (!pinch) return;
      event.stopPropagation();
      touch = undefined;
      suppressClick = true;
      if (event.touches.length < 2) pinch = undefined;
    });
    paper.addEventListener("touchcancel", () => { pinch = undefined; touch = undefined; });
    let drag: {x: number; y: number; left: number; top: number} | undefined;
    paper.addEventListener("pointerdown", event => {
      suppressClick = false;
      if (!zoomed || event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault();
      drag = {x: event.clientX, y: event.clientY, left: paper.scrollLeft, top: paper.scrollTop};
      paper.setPointerCapture(event.pointerId);
    });
    paper.addEventListener("pointermove", event => {
      if (!drag) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) suppressClick = true;
      paper.scrollTo(drag.left - dx, drag.top - dy);
    });
    paper.addEventListener("pointerup", () => { drag = undefined; });
    paper.addEventListener("pointercancel", () => { drag = undefined; });
    paper.querySelector("img")!.draggable = false;
  });
  window.addEventListener("resize", resetZoom);

  function show(index: number) {
    resetZoom();
    current = Math.max(0, Math.min(index, pages.length - 1));
    pages.forEach((page, i) => { page.hidden = i !== current; });
    previous.disabled = current === 0;
    const nextLabel = translateClient(current === pages.length - 1 ? "Noch einmal lesen ↺" : "Weiter →");
    next.setAttribute("aria-label", nextLabel);
    next.title = nextLabel;
    next.textContent = current === pages.length - 1 ? "↺" : "›";
    position.textContent = String(current + 1);
    book!.querySelectorAll<HTMLAnchorElement>(".story-reading-note nav a").forEach((link, i) => {
      if (i === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function open(index = 0) {
    if (active) return;
    active = true;
    dialog.append(book!);
    book!.classList.add("is-reading");
    document.documentElement.classList.add("story-reader-open");
    toolbar.hidden = help.hidden = false;
    show(index);
    dialog.showModal();
    book!.focus({preventScroll: true});
  }

  function close() {
    dialog.close();
  }

  dialog.addEventListener("close", () => {
    resetZoom();
    active = false;
    document.documentElement.classList.remove("story-reader-open");
    placeholder.after(book!);
    book!.classList.remove("is-reading");
    toolbar.hidden = help.hidden = true;
    pages.forEach(page => { page.hidden = false; });
    book!.querySelectorAll("[aria-current]").forEach(link => link.removeAttribute("aria-current"));
    history.replaceState(null, "", location.pathname + location.search);
    start.focus({preventScroll: true});
  });

  start.addEventListener("click", event => { event.preventDefault(); history.replaceState(null, "", "#lesen"); open(); });
  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current === pages.length - 1 ? 0 : current + 1));
  book.querySelector("[data-reader-close]")!.addEventListener("click", close);
  book.querySelectorAll<HTMLAnchorElement>(".story-reading-note nav a, .story-next").forEach(link => {
    link.addEventListener("click", event => {
      if (!active) return;
      event.preventDefault();
      show(Number(link.hash.replace("#seite-", "")) - 1);
    });
  });
  book.addEventListener("keydown", event => {
    if (!active || (event.target as HTMLElement).closest("input,textarea,select")) return;
    if (event.key === "Escape") { event.preventDefault(); if (zoomed) resetZoom(); else close(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
  });
  let touch: {x: number; y: number} | undefined;
  book.addEventListener("touchstart", event => {
    touch = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : undefined;
  }, {passive: true});
  book.addEventListener("touchend", event => {
    if (!active || !touch || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = undefined;
    if (zoomed) { if (Math.abs(dx) + Math.abs(dy) > 6) suppressClick = true; return; }
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  book.addEventListener("touchcancel", () => { touch = undefined; });
  if (location.hash === "#lesen") open();
}
