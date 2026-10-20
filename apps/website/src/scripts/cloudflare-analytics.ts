import { applyTrafficPreferenceFromUrl, isTrafficExcluded } from "./traffic-preferences";

export const initializeCloudflareAnalytics = () => {
  applyTrafficPreferenceFromUrl();
  if (isTrafficExcluded()) return;

  const configuration = document.querySelector<HTMLElement>("[data-traffic-analytics]");
  const token = configuration?.dataset.token;
  if (!token || document.querySelector("script[data-cf-beacon]")) return;

  const beacon = document.createElement("script");
  beacon.type = "module";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({ token });
  document.head.append(beacon);
};
