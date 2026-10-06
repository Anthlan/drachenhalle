export type CompetitionAction = { id: string; label: string; unit: string; points: number; phase: string; note?: string };
export type CompetitionDay = { id: string; day: string; title: string; victory: number; save: string; readiness: string; source: string; actions: CompetitionAction[] };
const action = (id: string, label: string, unit: string, points: number, phase = "", note?: string): CompetitionAction => ({ id, label, unit, points, phase, note });
const diamonds = action("diamonds", "Diamanten-Paket", "Diamanten laut Paketwertung", 35, "", "Die Anzeige nennt Diamanten-Paket, nicht den Verbrauch vorhandener Diamanten. Kein Kauf erforderlich.");
const radar = action("radar", "Radarquest abschließen", "Quests", 24150, "Radar / Ausdauer", "Abholzeitpunkt und Speicherregeln im Spiel prüfen.");
const build = action("build", "Baubeschleunigung", "Minuten", 126, "Bauentwicklung");
const research = action("research", "Forschungsbeschleunigung", "Minuten", 126, "Technologieforschung");
const training = action("training", "Trainingsbeschleunigung", "Minuten", 126, "Truppentraining");
const buildPower = action("build-power", "Energie durch Konstruktion erhalten", "Energie (Anzeige im Spiel)", 231 / 10, "Bauentwicklung", "Screenshot: 231 Punkte je 10 Energie. Anteilige Wertung bitte prüfen.");
const researchPower = action("research-power", "Energie durch Forschung erhalten", "Energie (Anzeige im Spiel)", 231 / 10, "Technologieforschung", "Screenshot: 231 Punkte je 10 Energie. Anteilige Wertung bitte prüfen.");
const xp = action("xp", "Helden-EP verbrauchen", "Helden-EP", 2 / 650, "Heldenentwicklung", "Screenshot: 2 Punkte je 650 Helden-EP; die Berechnung zählt vollständige 650er-Blöcke.");
const truck = action("truck", "UR-Transportlastwagen entsenden", "Lastwagen", 220000);
const ops = action("ops", "UR-Spezialeinsatz-Mission abschließen", "Missionen", 144000);
export const competitionDays: CompetitionDay[] = [
  { id: "mon", day: "Montag", title: "Radarerkundung", victory: 1, source: "20261006_195507000_iOS.jpg", save: "Radarquests für heute halten. Ausdauer und Kämpfermaterial gezielt einsetzen; Helden-EP können auch Donnerstag zählen.", readiness: "Für Ausdauereinsatz die Aufgaben zu Ausdauer/Radar prüfen; für Helden-EP Heldenentwicklung. Radarabschluss zählt nicht automatisch in der Einsatzbereitschaft.", actions: [diamonds, radar, action("parts", "Kämpferteil verwenden", "Teile", 5200), action("chips", "Kämpfer-Kampfchip verwenden", "Chips", 8), action("wing", "Fortgeschrittene Flügelmann-Komponente aus Truhe erhalten", "Komponenten", 2300), action("stamina", "Ausdauer verbrauchen", "Ausdauer", 310, "Radar / Ausdauer"), xp, action("food", "Nahrung sammeln", "Nahrung", .6, "", "6 Punkte je 10 Nahrung; Radar-Sammelquests ausgeschlossen."), action("metal", "Metall sammeln", "Metall", .6, "", "6 Punkte je 10 Metall; Radar-Sammelquests ausgeschlossen."), action("oil", "Öl sammeln", "Öl", 1, "", "6 Punkte je 6 Öl; Radar-Sammelquests ausgeschlossen.")] },
  { id: "tue", day: "Dienstag", title: "Basiskonstruktion", victory: 2, source: "20261006_195530000_iOS.jpg", save: "Bauabschlüsse, Baubeschleuniger und Überlebenden-Rekrutierung für heute planen. Radarvorrat für Mittwoch vorbereiten.", readiness: "Bauabschlüsse und Baubeschleuniger mit Bauentwicklung kombinieren, sofern beide Aufgabenlisten die Aktion werten.", actions: [diamonds, buildPower, build, action("survivors", "Überlebenden-Rekrutierung durchführen", "Rekrutierungen", 3200), ops, truck] },
  { id: "wed", day: "Mittwoch", title: "Technologieforschung", victory: 2, source: "20261006_195543000_iOS.jpg", save: "Forschungsdaten, Forschungsbeschleuniger und Kämpfer-Komponenten-Truhen für heute halten. Gesparte Radarquests werten.", readiness: "Forschung und Forschungsbeschleuniger mit Technologieforschung prüfen. Für Forschungsdaten und Komponenten-Truhen muss die konkrete Aufgabe ebenfalls gelistet sein.", actions: [diamonds, radar, action("data", "Forschungsdaten verwenden", "Forschungsdaten", 640, "Technologieforschung"), researchPower, research, ...[2310,6930,21000,63000,189000,567000,1701000].map((points,i) => action(`component-${i+1}`, `Kämpfer-Komponenten-Truhe Lv.${i+1} öffnen`, "Truhen", points))] },
  { id: "thu", day: "Donnerstag", title: "Heldentraining", victory: 2, source: "20261006_195559000_iOS.jpg", save: "Heldensplitter, Helden-Rekrutierung, Fähigkeiten-EP-Bücher und Helden-EP für heute halten. Radarvorrat für Freitag vorbereiten.", readiness: "Heldenentwicklung prüfen: Splitter, Rekrutierung, Fähigkeitenbücher und Helden-EP können unterschiedliche Aufgaben sein.", actions: [diamonds, action("ur", "UR-Heldensplitter verwenden", "Splitter", 21000, "Heldenentwicklung"), action("recruit", "Helden rekrutieren", "Rekrutierungen", 3680, "Heldenentwicklung"), action("books", "Fähigkeiten-EP-Buch verwenden", "Bücher", 24, "Heldenentwicklung"), xp, action("ssr", "SSR-Heldensplitter verwenden", "Splitter", 7200, "Heldenentwicklung"), action("sr", "SR-Heldensplitter verwenden", "Splitter", 2100, "Heldenentwicklung")] },
  { id: "fri", day: "Freitag", title: "Vollständige Militärvorbereitung", victory: 2, source: "20261006_195616000_iOS.jpg + 20261006_195629000_iOS.jpg", save: "Training und Trainingsbeschleuniger für heute planen. Auch Bau, Forschung und Radar zählen. Vorräte für einen knappen Samstag bewusst zurückhalten.", readiness: "Truppentraining für Soldaten/Trainingsbeschleuniger; Bauentwicklung für Bau; Technologieforschung für Forschung. Die jeweiligen Fenster getrennt nutzen.", actions: [diamonds, radar, buildPower, researchPower, training, build, research, ...[69,92,115,138,161,184,207,230,253,276].map((points,i) => action(`soldier-${i+1}`, `T${i+1}-Soldat ausbilden`, "Soldaten", points, "Truppentraining", "Aufwertungen sind in diesem Screenshot nicht ausdrücklich erklärt."))] },
  { id: "sat", day: "Samstag", title: "Feindangriff", victory: 4, source: "20261006_195640000_iOS.jpg + 20261006_195701000_iOS.jpg + 20261006_195712000_iOS.jpg", save: "Gemeinsamen Kampfeinsatz abstimmen und Schilde planen. Kämpfe und Verluste nicht nur für Punkte erzeugen. Kein belegter Radar-Wertungstag.", readiness: "Bau-, Forschungs- und Trainingsbeschleuniger mit dem jeweiligen Fenster prüfen. Heilung und Kampfpunkte haben hier keine bestätigte Einsatzbereitschafts-Zuordnung.", actions: [diamonds, truck, ops, action("heal", "Heilung beschleunigen", "Minuten", 126), training, research, build, ...[34,46,57,69,80,92,103,115,126,138].map((points,i) => action(`match-${i+1}`, `T${i+1} eliminieren – spezifischer Kampf`, "Soldaten", points, "", "Gesonderte Wertung; nicht mit allgemeiner Eliminierung addieren, ohne die Spielregel zu prüfen.")), ...[6,9,11,13,16,18,20,23,25,27].map((points,i) => action(`kill-${i+1}`, `T${i+1} eliminieren – allgemein`, "Soldaten", points)), ...[6,8,10,12,14,16,18,20,22,24].map((points,i) => action(`loss-${i+1}`, `T${i+1} verlieren`, "Soldaten", points, "", "Nur bereits erwartete Verluste bilanzieren; keine Verlustempfehlung."))] },
];
export const radarDays = [0, 2, 4];
// Punkteschwellen des Screenshot-Kontos, 06.10.2026.
// Quellen: 20261006_202428000_iOS.jpg, _202445000_, _202454000_.
export const competitionMilestones = [38000, 145000, 550000, 650000, 1020000, 2280000, 2630000, 3620000, 7190000];
export function milestoneProgress(current: number, planned: number) {
  return competitionMilestones.map((points, index) => ({
    points, number: index + 1,
    status: current >= points ? "reached" : current + planned >= points ? "planned" : "open",
    missing: Math.max(0, points - current - planned),
  }));
}
export function nextRadarDay(day: number) {
  for (let offset = 1; offset <= 7; offset++) if (radarDays.includes((day + offset) % 7)) return { index: (day + offset) % 7, days: offset };
  throw new Error("Radar-Wertungstag fehlt.");
}
export function actionPoints(action: CompetitionAction, quantity: number, points = action.points) {
  const block = action.id === "xp" ? 650 : ["build-power", "research-power", "food", "metal"].includes(action.id) ? 10 : action.id === "oil" ? 6 : 1;
  return Math.floor(quantity / block) * block * points;
}
export function actionBlock(action: CompetitionAction) {
  return action.id === "xp" ? 650 : ["build-power", "research-power", "food", "metal"].includes(action.id) ? 10 : action.id === "oil" ? 6 : 1;
}
