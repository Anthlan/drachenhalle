const TRAFFIC_EXCLUSION_KEY = "drachenhalle:traffic-excluded";

const writePreference = (excluded: boolean) => {
  try {
    if (excluded) {
      window.localStorage.setItem(TRAFFIC_EXCLUSION_KEY, "1");
    } else {
      window.localStorage.removeItem(TRAFFIC_EXCLUSION_KEY);
    }
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
};

export const applyTrafficPreferenceFromUrl = () => {
  const url = new URL(window.location.href);
  const preference = url.searchParams.get("traffic");
  if (preference !== "off" && preference !== "on") return;

  writePreference(preference === "off");
  url.searchParams.delete("traffic");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
};

export const isTrafficExcluded = () => {
  if (navigator.webdriver) return true;
  if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) return true;

  try {
    return window.localStorage.getItem(TRAFFIC_EXCLUSION_KEY) === "1";
  } catch {
    return false;
  }
};
