import previous from "./expedition-2026-10-10.json";
import current from "./expedition-2026-10-17.json";
import previousText from "../../../../content/Drachenwissen/Analysen/de/2026_10_10_Expeditionswahnsinn.md?raw";
import currentText from "../../../../content/Drachenwissen/Analysen/de/2026_10_17_Expeditionswahnsinn.md?raw";

export const expeditionReports = [
  { date: "2026-10-10", label: "10.10.2026", opponentServer: 97, minimumPoints: 1000, data: previous, analysisText: previousText },
  { date: "2026-10-17", label: "17.10.2026", opponentServer: 107, minimumPoints: 1000, data: current, analysisText: currentText },
];
export const latestExpeditionReport = expeditionReports.at(-1)!;
