let feedbackTimeout: number | undefined;

function showShareFeedback(message: string, isError = false) {
  const feedback = document.querySelector("[data-share-feedback]");
  if (!(feedback instanceof HTMLElement)) return;

  window.clearTimeout(feedbackTimeout);
  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
  feedback.classList.add("is-visible");
  feedbackTimeout = window.setTimeout(() => feedback.classList.remove("is-visible"), 2800);
}

async function copyImageLink(url: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  if (!copied) throw new Error("Link konnte nicht kopiert werden.");
}

async function shareLink(relativeUrl: string, linkLabel: "Bildlink" | "Seitenlink") {
  const url = new URL(relativeUrl, window.location.href).href;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ url });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  try {
    await copyImageLink(url);
    showShareFeedback(`${linkLabel} wurde kopiert.`);
  } catch {
    showShareFeedback(`Der ${linkLabel} konnte nicht kopiert werden.`, true);
  }
}

function openOriginalImage(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
}

async function saveOriginalImage(url: string, fileName: string, mimeType: string) {
  try {
    showShareFeedback("Originalbild wird vorbereitet …");
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`Original konnte nicht geladen werden: ${response.status}`);

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type || mimeType });
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const canShareFile = typeof navigator.share === "function"
      && typeof navigator.canShare === "function"
      && navigator.canShare({ files: [file] });

    if (isIOS && canShareFile) {
      showShareFeedback("Im Menü „Bild sichern“ oder „In Fotos sichern“ wählen.");
      try {
        await navigator.share({ files: [file] });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
      }
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    showShareFeedback("Originalbild wird heruntergeladen.");
  } catch {
    openOriginalImage(url);
    showShareFeedback("Original geöffnet – auf iOS das Bild gedrückt halten und „In Fotos sichern“ wählen.");
  }
}

export function initializeImageActions() {
  const shareButtons = document.querySelectorAll("[data-share-image], [data-share-page]");

  for (const button of shareButtons) {
    if (!(button instanceof HTMLButtonElement)) continue;

    button.addEventListener("click", () => {
      const url = button.dataset.shareUrl;
      if (!url) return;
      const linkLabel = button.hasAttribute("data-share-page") ? "Seitenlink" : "Bildlink";
      void shareLink(url, linkLabel);
    });
  }

  const saveButtons = document.querySelectorAll("[data-save-image]");

  for (const button of saveButtons) {
    if (!(button instanceof HTMLButtonElement)) continue;

    button.addEventListener("click", () => {
      const url = button.dataset.originalUrl;
      const fileName = button.dataset.fileName;
      const mimeType = button.dataset.mimeType;
      if (!url || !fileName || !mimeType) return;
      void saveOriginalImage(url, fileName, mimeType);
    });
  }
}
