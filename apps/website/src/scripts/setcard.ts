type CardLayout = "grid" | "feature" | "stack";

function getLayout(value: string | null): CardLayout {
  return value === "feature" || value === "stack" ? value : "grid";
}

export function mountSetcard(root: HTMLElement) {
  function element<T extends HTMLElement = HTMLElement>(selector: string): T {
    return root.querySelector<T>(selector)!;
  }

  const library = element("[data-library]");
  const cards = element("[data-cards]");
  const title = element<HTMLInputElement>("[data-title]");
  const layout = element<HTMLSelectElement>("[data-layout-picker]");
  const source = element<HTMLSelectElement>("select[data-source]");
  const search = element<HTMLInputElement>("[data-search]");
  const noResults = element("[data-no-results]");
  const more = element<HTMLButtonElement>("[data-more]");
  const share = element<HTMLButtonElement>("[data-share]");
  const edit = element<HTMLButtonElement>("[data-edit]");
  const shareLink = element<HTMLInputElement>("[data-share-link]");
  const copied = element("[data-copied]");
  const previewTitle = element("[data-preview-title]");
  const empty = element("[data-empty]");
  const unavailable = element("[data-unavailable]");
  const count = element("[data-count]");
  const libraryTemplate = element<HTMLTemplateElement>("[data-library-card]");
  const previewTemplate = element<HTMLTemplateElement>("[data-preview-card]");
  const catalog = new Map(
    Array.from(element<HTMLTemplateElement>("[data-image-catalog]").content.querySelectorAll<HTMLElement>("[data-id]"))
      .map((node) => {
        const { id, source, thumbnail, image, people, width, height } = node.dataset;
        const title = node.textContent?.trim() ?? "";
        return [id!, {
          id: id!,
          source,
          thumbnail: thumbnail!,
          image: image!,
          width: Number(width),
          height: Number(height),
          title,
          searchText: normalize(`${title} ${people ?? ""}`),
        }] as const;
      }),
  );
  const pageSize = 24;
  const numberFormat = new Intl.NumberFormat(document.documentElement.lang);
  let visible = pageSize;
  let selection: string[] = [];
  let viewOnly = false;

  function normalize(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
  }

  function updateLibrarySelection() {
    const selected = new Set(selection);
    for (const button of library.querySelectorAll<HTMLButtonElement>("button[data-id]")) {
      button.setAttribute("aria-pressed", String(selected.has(button.dataset.id!)));
    }
  }

  function renderLibrary(append = false) {
    const query = normalize(search.value);
    const terms = query ? query.split(/\s+/) : [];
    const matches = Array.from(catalog.values()).filter((item) =>
      (source.value === "all" || source.value === item.source)
      && terms.every((term) => item.searchText.includes(term)),
    );

    const offset = append ? library.childElementCount : 0;
    const fragment = document.createDocumentFragment();
    for (const item of matches.slice(offset, visible)) {
      const button = libraryTemplate.content.firstElementChild!.cloneNode(true) as HTMLButtonElement;
      button.dataset.id = item.id;
      button.querySelector("img")!.src = item.thumbnail;
      button.querySelector("[data-image-title]")!.textContent = item.title;
      fragment.append(button);
    }
    if (!append) library.replaceChildren();
    library.append(fragment);
    updateLibrarySelection();
    noResults.hidden = matches.length > 0;
    more.hidden = visible >= matches.length;
    if (append) (library.children[offset] as HTMLElement | undefined)?.focus();
  }

  function clearShareFeedback() {
    shareLink.hidden = true;
    copied.hidden = true;
  }

  function updatePreviewTitle() {
    previewTitle.textContent = title.value.trim();
    previewTitle.hidden = !previewTitle.textContent;
  }

  function selectionUrl(presentation: boolean) {
    const url = new URL(location.href);
    const params = new URLSearchParams();
    if (presentation) params.set("ansicht", "1");
    if (layout.value !== "grid") params.set("layout", getLayout(layout.value));
    if (title.value.trim()) params.set("titel", title.value.trim());
    selection.forEach((id) => params.append("bild", id));
    url.hash = params.toString();
    return url;
  }

  function saveDraft() {
    history.replaceState(history.state, "", selectionUrl(false));
  }

  function renderPreview(focusIndex?: number, action?: string) {
    const fragment = document.createDocumentFragment();
    let nextFocus: HTMLElement | undefined;

    selection.forEach((id, index) => {
      const item = catalog.get(id)!;
      const card = previewTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
      card.dataset.id = id;
      const image = card.querySelector("img")!;
      if (item.width && item.height) {
        image.width = item.width;
        image.height = item.height;
      }
      image.src = item.image;
      image.alt = item.title;
      const link = card.querySelector<HTMLAnchorElement>("[data-full-image]")!;
      link.href = item.image;
      card.querySelector("[data-image-title]")!.textContent = item.title;
      const controls = card.querySelector<HTMLElement>("[data-card-editor]")!;
      controls.hidden = viewOnly;
      controls.querySelector<HTMLButtonElement>('[data-action="earlier"]')!.disabled = index === 0;
      controls.querySelector<HTMLButtonElement>('[data-action="later"]')!.disabled = index === selection.length - 1;
      if (index === focusIndex) {
        nextFocus = Array.from(controls.querySelectorAll("button")).find((button) =>
          button.dataset.action === action && !button.disabled,
        ) ?? controls.querySelector<HTMLButtonElement>('[data-action="remove"]')!;
      }
      fragment.append(card);
    });

    cards.replaceChildren(fragment);
    cards.dataset.layout = getLayout(layout.value);
    updatePreviewTitle();
    empty.hidden = selection.length > 0 || viewOnly;
    unavailable.hidden = selection.length > 0 || !viewOnly;
    share.disabled = selection.length === 0;
    count.textContent = numberFormat.format(selection.length);
    updateLibrarySelection();
    clearShareFeedback();
    if (focusIndex !== undefined) (nextFocus ?? search).focus();
  }

  function loadLocation() {
    const params = new URLSearchParams(location.hash.slice(1));
    viewOnly = params.get("ansicht") === "1";
    selection = [...new Set(params.getAll("bild"))].filter((id) => catalog.has(id));
    title.value = (params.get("titel") ?? "").slice(0, title.maxLength);
    layout.value = getLayout(params.get("layout"));
    root.dataset.mode = viewOnly ? "view" : "edit";
    edit.hidden = !viewOnly;
    if (!viewOnly) renderLibrary();
    renderPreview();
  }

  function resetFilter() {
    visible = pageSize;
    renderLibrary();
  }

  source.addEventListener("change", resetFilter);
  search.addEventListener("input", resetFilter);
  more.addEventListener("click", () => {
    visible += pageSize;
    renderLibrary(true);
  });
  library.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-id]");
    if (!button) return;
    const id = button.dataset.id!;
    selection = selection.includes(id) ? selection.filter((selected) => selected !== id) : [...selection, id];
    renderPreview();
    saveDraft();
  });

  cards.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
    const card = button?.closest<HTMLElement>("[data-id]");
    if (!button || !card || viewOnly) return;
    const index = selection.indexOf(card.dataset.id!);
    if (index < 0) return;
    const action = button.dataset.action;
    if (action === "remove") {
      selection.splice(index, 1);
      renderPreview(Math.min(index, selection.length - 1), action);
      saveDraft();
      return;
    }
    const next = index + (action === "earlier" ? -1 : 1);
    if (next < 0 || next >= selection.length) return;
    [selection[index], selection[next]] = [selection[next], selection[index]];
    renderPreview(next, action);
    saveDraft();
  });

  title.addEventListener("input", () => {
    updatePreviewTitle();
    clearShareFeedback();
    saveDraft();
  });
  layout.addEventListener("change", () => {
    cards.dataset.layout = getLayout(layout.value);
    clearShareFeedback();
    saveDraft();
  });
  share.addEventListener("click", async () => {
    const url = selectionUrl(true);
    try {
      await navigator.clipboard.writeText(url.href);
      copied.hidden = false;
    } catch {
      shareLink.value = url.href;
      shareLink.hidden = false;
      shareLink.focus();
      shareLink.select();
    }
  });
  edit.addEventListener("click", () => {
    saveDraft();
    loadLocation();
    search.focus();
  });
  window.addEventListener("hashchange", loadLocation);
  loadLocation();
}
