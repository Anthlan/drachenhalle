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
  const start = document.querySelector<HTMLAnchorElement>("[data-start-reader]")!;
  const placeholder = document.createComment("Comic-Reader");
  book.before(placeholder);
  const dialog = document.createElement("dialog");
  dialog.className = "story-reader-dialog";
  dialog.setAttribute("aria-label", document.querySelector("h1")?.textContent || book.getAttribute("aria-label")!);
  document.body.append(dialog);
  let active = false;
  let current = 0;

  function show(index: number) {
    current = Math.max(0, Math.min(index, pages.length - 1));
    pages.forEach((page, i) => { page.hidden = i !== current; });
    previous.disabled = current === 0;
    next.textContent = translateClient(current === pages.length - 1 ? "Noch einmal lesen ↺" : "Weiter →");
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
    if (event.key === "Escape") { event.preventDefault(); close(); }
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
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  book.addEventListener("touchcancel", () => { touch = undefined; });
  if (location.hash === "#lesen") open();
}
