export const raidQuestions = [
  {
    id: "own-truck", icon: "🚚", title: "Ein Lastwagen auf S105",
    question: "Ein Lastwagen auf unserem eigenen Server S105 hat besonders gute Beute. Darfst du ihn plündern?",
    options: ["Ja, bei guter Beute ist das erlaubt.", "Nein, Lastwagen unseres Servers sind tabu."], correct: 1,
    explanation: "Wir plündern keine Lastwagen unseres eigenen Servers. Auch gute Beute ändert daran nichts.",
  },
  {
    id: "foreign-train", icon: "🚂", title: "Ein Güterzug auf S107",
    question: "Du hast die Servernummer geprüft: Der Güterzug gehört zu S107, unser Server ist S105. Ist dieses Ziel nach unserer Plünderungsregel erlaubt?",
    options: ["Ja, der Zug liegt auf einem anderen Server.", "Nein, Güterzüge dürfen wir nie plündern."], correct: 0,
    explanation: "Lastwagen, Güterzüge und Spezialmissionen plündern wir nur auf anderen Servern. S107 ist ein Fremdserver.",
  },
  {
    id: "own-mission", icon: "📦", title: "Ein geteilter Container",
    question: "Im Chat wird eine Spezialmission mit [S:105 X:686 Y:467] geteilt. Was tust du?",
    options: ["Plündern – im Chat geteilte Ziele sind immer erlaubt.", "Nicht plündern – S105 ist unser eigener Server."], correct: 1,
    explanation: "Die erste Zahl in den Koordinaten ist der Server. S:105 bedeutet eigener Server; diese Spezialmission ist tabu.",
  },
  {
    id: "foreign-mission", icon: "🗺️", title: "Eine Mission auf S107",
    question: "Über einem Container steht „Kriegsgebiet S107“. Darfst du die Spezialmission nach unserer Plünderungsregel plündern?",
    options: ["Nein, Spezialmissionen sind grundsätzlich verboten.", "Ja, die Anzeige bestätigt einen anderen Server."], correct: 1,
    explanation: "Spezialmissionen sind auf Fremdservern erlaubt. Prüfe die Serveranzeige vor dem Start.",
  },
  {
    id: "unknown-server", icon: "🔎", title: "Keine Serveranzeige",
    question: "Du siehst einen Container, aber keine Fremdserver-Anzeige. Der Server ist nicht bestätigt. Was ist richtig?",
    options: ["Erst prüfen; ohne bestätigten Fremdserver nicht plündern.", "Plündern – ohne Anzeige gelten keine Einschränkungen."], correct: 0,
    explanation: "Auf unserem Server S105 fehlt die Fremdserver-Anzeige. Plündere erst, wenn du einen anderen Server sicher bestätigt hast.",
  },
  {
    id: "truck-setting", icon: "⚙️", title: "Die richtige Einstellung",
    question: "Welche Einstellung hilft dir bei Transportlastwagen, und was musst du trotzdem tun?",
    options: ["Eigene Serverziele einschließen; eine Prüfung ist unnötig.", "„Transportlastwagen dieses Servers ausschließen“ aktivieren und die Servernummer trotzdem prüfen."], correct: 1,
    explanation: "Der Ausschluss-Haken unterstützt unsere Regel. Prüfe trotzdem vor jeder Plünderung die Servernummer – auch bei Güterzügen und Spezialmissionen.",
  },
] as const;
