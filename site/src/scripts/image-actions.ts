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

async function shareImage(title: string, relativeUrl: string) {
  const url = new URL(relativeUrl, window.location.href).href;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text: `${title} aus der DIE Drachenhalle`,
        url,
      });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  try {
    await copyImageLink(url);
    showShareFeedback("Bildlink wurde kopiert.");
  } catch {
    showShareFeedback("Der Bildlink konnte nicht kopiert werden.", true);
  }
}

export function initializeImageActions() {
  const shareButtons = document.querySelectorAll("[data-share-image]");

  for (const button of shareButtons) {
    if (!(button instanceof HTMLButtonElement)) continue;

    button.addEventListener("click", () => {
      const url = button.dataset.shareUrl;
      if (!url) return;
      void shareImage(button.dataset.shareTitle ?? "Bild der DIE Drachenhalle", url);
    });
  }
}
