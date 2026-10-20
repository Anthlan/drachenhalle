import { applyTrafficPreferenceFromUrl, isTrafficExcluded } from "./traffic-preferences";

type PageViewResponse = {
  path: string;
  views: number;
  totalViews: number;
};

const numberFormatter = new Intl.NumberFormat(document.documentElement.lang === "de" ? "de-DE" : document.documentElement.lang);

export const initializePageViews = () => {
  applyTrafficPreferenceFromUrl();

  const counter = document.querySelector<HTMLElement>("[data-page-views]");
  if (!counter) return;

  const endpoint = counter.dataset.endpoint;
  const current = counter.querySelector<HTMLElement>("[data-page-view-current]");
  const total = counter.querySelector<HTMLElement>("[data-page-view-total]");
  if (!endpoint || !current || !total) return;

  const excluded = isTrafficExcluded();
  const requestUrl = excluded
    ? `${endpoint}/api/views?path=${encodeURIComponent(window.location.pathname)}`
    : `${endpoint}/api/views`;

  fetch(requestUrl, {
    method: excluded ? "GET" : "POST",
    headers: excluded ? undefined : { "Content-Type": "application/json" },
    body: excluded ? undefined : JSON.stringify({ path: window.location.pathname }),
    cache: "no-store",
    referrerPolicy: "no-referrer",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Page-view API returned ${response.status}`);
      return response.json() as Promise<PageViewResponse>;
    })
    .then((result) => {
      if (!Number.isSafeInteger(result.views) || !Number.isSafeInteger(result.totalViews)) return;
      current.textContent = numberFormatter.format(result.views);
      total.textContent = numberFormatter.format(result.totalViews);
      counter.hidden = false;
    })
    .catch(() => {
      // The counter is an enhancement. A temporary API failure must not affect the page.
    });
};
