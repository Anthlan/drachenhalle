export type ChronicleTheme = {
  accent: string;
  accentSoft: string;
  glow: string;
  surface: string;
};

export type CharacterChronicle = {
  slug: string;
  name: string;
  title: string;
  world: string;
  sigil: string;
  heroImage: string;
  heroAlt: string;
  chapterImage: string;
  chapterImageAlt: string;
  chapterCaption: string;
  invitation: string;
  opening: string[];
  quote: string;
  traits: Array<{ icon: string; title: string; text: string }>;
  chapters: Array<{ eyebrow: string; title: string; paragraphs: string[] }>;
  worldText: string[];
  reality?: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    caption: string;
  };
  connectionTitle: string;
  connections: Array<{ name: string; text: string }>;
  closing: string;
  theme: ChronicleTheme;
};

export const characterChronicles: CharacterChronicle[] = [
  {
    slug: "anthlan",
    name: "Anthlan",
    title: "Der Architekt der Gemeinschaft",
    world: "Die Sternwarte der verbundenen Wege",
    sigil: "✦",
    heroImage: "/drachenhalle/brand/officer-anthlan-world.webp",
    heroAlt: "Anthlan in seiner Sternwarte über den miteinander verbundenen Welten",
    chapterImage: "/drachenhalle/brand/chronicle-anthlan-table.webp",
    chapterImageAlt: "Anthlan mit Kaffee über einem lebendigen Strategietisch voller verbundener Orte",
    chapterCaption: "Wo viele Wege zusammenlaufen, bleibt selten alles genau dort, wo Anthlan es eingezeichnet hat.",
    invitation: "Folgt den goldenen Wegen hinauf in eine Sternwarte, die zugleich Kartenraum, Treffpunkt und Ausgangspunkt für das nächste gemeinsame Abenteuer ist.",
    opening: [
      "Wer Anthlans Sternwarte zum ersten Mal betritt, erwartet vielleicht einen einsamen Weltenlenker. Stattdessen findet man offene Karten, verschobene Spielfiguren, mehrere benutzte Stühle und irgendwo dazwischen eine Kaffeetasse, die ganz sicher eben noch voll war.",
      "Anthlan führt nicht von einem Thron aus. Er schafft Verbindungen. Zwischen Menschen, Ideen und Orten sucht er nach dem Weg, auf dem aus vielen Einzelnen eine Gemeinschaft werden kann. Seine Autorität entsteht dabei weniger aus Abstand als aus der Gewissheit, dass er bleibt, erklärt und Verantwortung übernimmt.",
    ],
    quote: "Ich habe einen Plan. Wahrscheinlich sogar mehrere. Jetzt müssen sie sich nur noch miteinander vertragen.",
    traits: [
      { icon: "⌘", title: "Überblick", text: "Er sieht Wege, Abhängigkeiten und Möglichkeiten, bevor sie für andere sichtbar werden." },
      { icon: "◇", title: "Verbindung", text: "Seine stärkste Strategie besteht darin, unterschiedliche Menschen miteinander ins Gespräch zu bringen." },
      { icon: "☕", title: "Bodenhaftung", text: "Kaffee, Selbstironie und ein leicht schelmischer Blick bewahren ihn vor zu viel Erhabenheit." },
    ],
    chapters: [
      {
        eyebrow: "Zwischen Karten und Menschen",
        title: "Strategie beginnt für ihn nicht mit Befehlen",
        paragraphs: [
          "Auf Anthlans Tisch stehen keine gesichtslosen Armeen. Jede Figur trägt eine eigene Geschichte, jede Route betrifft jemanden, und jeder gute Plan muss Raum für Widerspruch lassen. Er hört zu, sortiert und übersetzt verschiedene Blickwinkel in ein gemeinsames Ziel.",
          "Das macht ihn nicht unfehlbar. Manchmal wächst das Durcheinander schneller als seine Listen. Gerade dann zeigt sich seine eigentliche Stärke: Er kann über sich selbst lachen, neu ansetzen und andere mitdenken lassen.",
        ],
      },
      {
        eyebrow: "Die offene Sternwarte",
        title: "Ein Gastgeber über den Wolken",
        paragraphs: [
          "Die Sternwarte ist nie wirklich abgeschlossen. Goldene Wege führen zu bewohnten Inseln, zur Elbe und weit darüber hinaus. Ankommende finden keinen Audienzsaal, sondern einen Platz am Tisch.",
          "Hier werden Reisen geplant, Streitpunkte entwirrt und gelegentlich Katastrophen verwaltet, die fünf Minuten zuvor noch als harmlose Idee begonnen haben. Anthlan hält den Raum zusammen – meistens mit Übersicht, manchmal mit Improvisation und fast immer mit Kaffee.",
        ],
      },
    ],
    worldText: [
      "Unter dem gläsernen Dach ziehen Sternbilder ihre Bahnen. Darunter verbinden goldene Linien Städte, Inseln und Menschen. Manche Wege sind sauber geplant, andere entstehen erst, wenn jemand den Mut hat, den ersten Schritt zu machen.",
      "Die vielen Stühle sind wichtiger als das große Teleskop: Sie zeigen, dass diese Welt nicht für einen Herrscher gebaut wurde, sondern für eine Gemeinschaft, die gemeinsam weitersehen möchte.",
    ],
    reality: {
      image: "/drachenhalle/brand/chronicle-anthlan-lived-world.webp",
      imageAlt: "Anthlan im Gespräch mit Bewohnern an einem gemeinsamen Tisch in der belebten Stadt unter seiner Sternwarte",
      eyebrow: "Unter der Sternwarte",
      title: "Wo aus Wegen gemeinsames Leben wird",
      paragraphs: [
        "Unter der Sternwarte liegen keine stillen Modellstädte. An den goldenen Wegen wird gearbeitet, gestritten, gelacht und gemeinsam gegessen. Reisende kommen an, Werkstätten bleiben länger offen als geplant und an den Tischen entstehen aus zufälligen Begegnungen neue Verbindungen.",
        "Hier wird sichtbar, wofür Anthlan Karten zeichnet: nicht für perfekte Linien, sondern damit wir einander erreichen können. Er betrachtet dieses Leben nicht aus der Ferne. Er sitzt mit am Tisch, hört zu und hilft dabei, aus vielen einzelnen Wegen einen gemeinsamen Ort zu machen.",
      ],
      caption: "Unterhalb der Sternwarte zeigt sich, ob aus einem guten Plan auch ein gemeinsamer Ort wird.",
    },
    connectionTitle: "Wer an seinem Tisch Spuren hinterlässt",
    connections: [
      { name: "Somea", text: "bringt Gefühl, Energie und beherzte Abkürzungen in seine sorgfältig gezeichneten Pläne." },
      { name: "mysteryZ", text: "teilt Diplomatie und Planung mit ihm, ohne je zur bloßen Assistentin zu werden." },
      { name: "Drachenherz", text: "ist einer jener Gefährten, mit denen eine Karte und zwei Becher manchmal für ein ganzes Gespräch genügen." },
    ],
    closing: "Anthlan baut keine Welt, in der alle ihm folgen. Er baut eine, in der wir einander finden.",
    theme: { accent: "#76a9ff", accentSoft: "#dbe8ff", glow: "rgba(70, 126, 232, .34)", surface: "#0d1834" },
  },
  {
    slug: "mysteryz",
    name: "mysteryZ",
    title: "Die Gesandte im Schatten",
    world: "Die Kanzlei der roten Wege am Rhein",
    sigil: "◆",
    heroImage: "/drachenhalle/brand/officer-mysteryz-world-v3.webp",
    heroAlt: "mysteryZ in ihrer dunklen Kanzlei der roten Wege über dem Rhein",
    chapterImage: "/drachenhalle/brand/chronicle-mysteryz-dispatch.webp",
    chapterImageAlt: "mysteryZ zwischen roten Routen, versiegelten Schreiben und einem bemerkenswerten Aktenstapel",
    chapterCaption: "Informationen werden geschützt, Wege werden geöffnet – und manche Aktenstapel sind ganz eindeutig nicht ihr Job.",
    invitation: "Tretet leise ein. Hinter rotem Siegelwachs, Regen und einer schwarzen Drachenmaske arbeitet eine der zuverlässigsten Verbindungen unserer Allianz.",
    opening: [
      "Die Kanzlei liegt hoch über dem nächtlichen Rhein. Wer dort eintritt, hört zuerst den Regen an den Fenstern und sieht dann die roten Linien auf dem Kartentisch: Absprachen, Nachrichten und Wege, die nur funktionieren, weil jemand sie im richtigen Moment zusammenführt.",
      "mysteryZ braucht keine große Bühne. Ihre Wirkung entsteht in der Ruhe vor einer Entscheidung, in einer präzisen Nachricht und in der Grenze, die sie genau dann zieht, wenn aus Hilfsbereitschaft eine endlose Aufgabenliste werden soll.",
    ],
    quote: "Ich kümmere mich darum. Um das dort allerdings ganz bestimmt nicht.",
    traits: [
      { icon: "✉", title: "Diplomatie", text: "Sie findet Formulierungen und Wege, die Türen öffnen, ohne unnötigen Lärm zu verursachen." },
      { icon: "⬡", title: "Loyalität", text: "Sie schützt Informationen und Gemeinschaft durch Beständigkeit, nicht durch große Bekenntnisse." },
      { icon: "☕", title: "Trockener Humor", text: "Ein Blick über den Tassenrand genügt häufig, um die Lage vollständig zu kommentieren." },
    ],
    chapters: [
      {
        eyebrow: "Die Arbeit im Hintergrund",
        title: "Einfluss muss nicht laut sein",
        paragraphs: [
          "Während andere noch darüber sprechen, dass etwas geregelt werden müsste, sind bei mysteryZ häufig bereits die richtigen Nachrichten unterwegs. Sie beobachtet genau, trennt Wichtiges von Lärm und bewahrt auch dann einen klaren Kopf, wenn mehrere Interessen gleichzeitig an ihrem Tisch ankommen.",
          "Ihre Maske und Kapuze gehören dabei zu ihr. Sie schaffen den geschützten Raum, aus dem heraus sie selbstbestimmt handeln kann. Nähe zeigt sie nicht durch große Gesten, sondern dadurch, dass sie bleibt, mitdenkt und zuverlässig zurückkehrt.",
        ],
      },
      {
        eyebrow: "Rote Linien über dem Rhein",
        title: "Jede Verbindung braucht Vertrauen",
        paragraphs: [
          "Die leuchtenden Routen der Kanzlei sind kein Netz zum Einfangen. Sie sind sichere Wege zwischen Menschen, die einander nicht immer direkt erreichen können. mysteryZ kennt ihre Abzweigungen, ihre Risiken und die Stellen, an denen eine einzige unbedachte Nachricht alles verändern würde.",
          "Zwischen Siegeln und Karten bleibt Raum für Kaffee, eine warme Mahlzeit und jenen kantigen Humor, der selbst einen zu langen Abend wieder auf ein erträgliches Maß zurechtrückt.",
        ],
      },
    ],
    worldText: [
      "Durch die hohen Fenster spiegelt sich das Licht der Rheinmetropole. Rote Weglinien wandern über Karten und verschwinden in verschlossenen Fächern. Nichts wirkt zufällig, aber auch nichts vollkommen starr.",
      "Weit draußen zieht manchmal ein blau-goldener Drache durch die Wolken. Er ist kein Wächter über ihr, sondern ein stilles Zeichen dafür, dass selbst eine Schattengesandte nicht allein arbeitet.",
    ],
    connectionTitle: "Die Menschen hinter den Nachrichten",
    connections: [
      { name: "Anthlan", text: "teilt mit ihr das diplomatische Spielfeld – und respektiert, dass sie ihren eigenen Weg wählt." },
      { name: "Die Gemeinschaft", text: "kann sich auf ihre Loyalität verlassen, gerade weil diese nie blinder Gehorsam ist." },
      { name: "Das Chaos", text: "wird sortiert, verhandelt oder mit einem sehr eindeutigen Blick zurück an den Absender geschickt." },
    ],
    closing: "mysteryZ steht selten im Mittelpunkt des Weges. Aber erstaunlich oft führt er nur deshalb ans Ziel, weil sie ihn geöffnet hat.",
    theme: { accent: "#df6764", accentSoft: "#f3c0a8", glow: "rgba(183, 47, 55, .34)", surface: "#251019" },
  },
  {
    slug: "somea",
    name: "Somea",
    title: "Die Göttin der tausend Stimmen",
    world: "Der Salon der tausend Stimmen",
    sigil: "✧",
    heroImage: "/drachenhalle/brand/officer-somea-world-v4.webp",
    heroAlt: "Somea in ihrem warmen nächtlichen Salon über Berlin",
    chapterImage: "/drachenhalle/brand/chronicle-somea-lanterns.webp",
    chapterImageAlt: "Somea entzündet eines der persönlichen Lichter an ihrem runden Gemeinschaftstisch",
    chapterCaption: "Kein Licht gleicht dem anderen. Gerade deshalb bemerkt Somea, wenn eines davon leiser wird.",
    invitation: "Im Salon über Berlin hat jede Stimme einen Platz, jedes Licht seine eigene Geschichte und niemand bleibt lange unbemerkt am Rand.",
    opening: [
      "Someas Salon ist nicht still. Hier laufen Sorgen, Ideen, Scherze und gelegentlich sehr deutliche Meinungen zusammen. Mitten darin bewegt sie sich nicht wie eine ferne Göttin, sondern wie jemand, der jedes Licht am Tisch kennt.",
      "Ihre besondere Macht besteht darin, Menschen wahrzunehmen. Somea hört nicht nur, wer spricht. Sie merkt auch, wer plötzlich schweigt, wer noch keinen Platz gefunden hat und wer gerade eine ehrliche Frage statt einer schnellen Lösung braucht.",
    ],
    quote: "Du gehörst an diesen Tisch. Und jetzt erzähl mir, was wirklich los ist.",
    traits: [
      { icon: "♡", title: "Herzlichkeit", text: "Sie geht auf Menschen zu und macht Zugehörigkeit persönlich spürbar." },
      { icon: "⚡", title: "Temperament", text: "Gefühl, Klarheit und Tatendrang gehören bei ihr untrennbar zusammen." },
      { icon: "◉", title: "Aufmerksamkeit", text: "Auch eine leise Stimme oder ein fast erloschenes Licht entgeht ihr nicht." },
    ],
    chapters: [
      {
        eyebrow: "Ein Platz für jede Stimme",
        title: "Gesehen werden ist mehr als anwesend sein",
        paragraphs: [
          "Am runden Tisch gibt es keine bedeutungslosen Plätze. Jeder trägt ein eigenes Zeichen, eine Erinnerung und eine andere Art von Licht. Somea versucht nicht, daraus Gleichförmigkeit zu machen. Sie hält die Unterschiede lebendig und sorgt dafür, dass daraus dennoch ein Wir entsteht.",
          "Wenn jemand am Rand steht, wartet sie nicht immer geduldig auf eine Einladung. Sie fragt nach, mischt sich ein und kann dabei bemerkenswert direkt werden. Diese Direktheit ist keine Kälte, sondern die ungeduldige Seite ihrer Fürsorge.",
        ],
      },
      {
        eyebrow: "Herz und Gewitter",
        title: "Wärme ohne Beliebigkeit",
        paragraphs: [
          "Somea kann trösten, begeistern und im nächsten Moment sehr klar benennen, was nicht in Ordnung ist. Ihr Salon ist deshalb kein konfliktfreier Ort. Er ist ein Ort, an dem Beziehungen wichtig genug sind, um ehrlich miteinander umzugehen.",
          "Zwischen Saphirfäden, Katzenpfoten und einem auffällig gut bewachten roten Knopf bleibt immer Platz für Humor. Manche Pläne verlassen den Salon dadurch allerdings etwas schneller, als Anthlan es ursprünglich vorgesehen hatte.",
        ],
      },
    ],
    worldText: [
      "Unter dem Berliner Nachthimmel stehen die Türen offen. Goldene und saphirblaue Fäden wandern zwischen persönlichen Lichtern, ohne sie zu fesseln. Sie zeigen Nähe, nicht Kontrolle.",
      "Die schwarze Katze wählt ihren Platz mit derselben Selbstverständlichkeit wie Somea ihre Menschen: aufmerksam, eigenwillig und erstaunlich treffsicher.",
    ],
    connectionTitle: "Stimmen, die ihren Salon verändern",
    connections: [
      { name: "Anthlan", text: "gibt ihren Impulsen Struktur – oder versucht zumindest, mit ihrer Geschwindigkeit Schritt zu halten." },
      { name: "mysteryZ", text: "begegnet ihrem offenen Temperament mit Ruhe, Grenzen und einem trockenen Kommentar." },
      { name: "Unsere Mitglieder", text: "sind für Somea keine Menge, sondern viele einzelne Geschichten, die alle gesehen werden sollen." },
    ],
    closing: "Somea macht aus vielen Stimmen keinen Chor, der gleich klingen muss. Sie sorgt dafür, dass wir einander überhaupt hören.",
    theme: { accent: "#7caeff", accentSoft: "#efb8d7", glow: "rgba(71, 126, 231, .36)", surface: "#162653" },
  },
  {
    slug: "davinci1986",
    name: "DaVinci1986",
    title: "Die Hüterin der offenen Wege",
    world: "Das Haus der offenen Wege",
    sigil: "✺",
    heroImage: "/drachenhalle/brand/officer-davinci1986-world.webp",
    heroAlt: "DaVinci1986 in ihrem Haus der offenen Wege über einer alpinen Seenlandschaft",
    chapterImage: "/drachenhalle/brand/chronicle-davinci-welcome.webp",
    chapterImageAlt: "DaVinci1986 bereitet Laternen, Einladungen und Reiseplätze für noch nicht angekommene Gäste vor",
    chapterCaption: "Noch bevor jemand anklopft, sind Licht, Karte und ein sicherer Platz bereits vorbereitet.",
    invitation: "Über dem Alpensee öffnen sich Türen in viele Richtungen. An jeder wartet das leise Versprechen, dass niemand ohne Orientierung weiterziehen muss.",
    opening: [
      "Im Haus der offenen Wege beginnt Hilfe oft, bevor jemand ausdrücklich darum bittet. Eine Laterne brennt bereits, eine Einladung liegt bereit und auf dem Kartentisch ist die nächste sichere Verbindung markiert.",
      "DaVinci1986 beobachtet aufmerksam, wo etwas fehlt. Sie drängt sich nicht vor, sondern wird genau dort wirksam, wo aus einer kleinen Geste echte Unterstützung werden kann. Dabei begegnet sie jedem mit einer ruhigen, erwachsenen Herzlichkeit.",
    ],
    quote: "Kommt erst einmal an. Den nächsten Weg finden wir dann gemeinsam.",
    traits: [
      { icon: "✦", title: "Voraussicht", text: "Sie erkennt offene Fragen und bereitet Unterstützung vor, bevor sie zum Problem werden." },
      { icon: "⌖", title: "Orientierung", text: "Karten, Wege und klare Abläufe werden bei ihr zu einer freundlichen Einladung." },
      { icon: "❖", title: "Respekt", text: "Sie hilft auf Augenhöhe und lässt Menschen ihren eigenen Platz und ihr eigenes Tempo." },
    ],
    chapters: [
      {
        eyebrow: "Hilfe, die schon bereitsteht",
        title: "Aufmerksamkeit wird zur Handlung",
        paragraphs: [
          "DaVinci1986 wartet nicht am Ende eines Weges und prüft, wer ihn erfolgreich bewältigt hat. Sie geht ein Stück entgegen. Eine unklare Information wird verständlich, ein neuer Ankommender findet Anschluss und aus einer organisatorischen Aufgabe wird das Gefühl, willkommen zu sein.",
          "Ihre Unterstützung bleibt unaufdringlich. Sie nimmt anderen nicht den Weg ab, sondern sorgt dafür, dass er begehbar wird.",
        ],
      },
      {
        eyebrow: "Morgenlicht und Sternkarten",
        title: "Erwachsene Ruhe mit einem verspielten Funken",
        paragraphs: [
          "Das Haus ist geordnet, aber nicht steril. Zwischen Kompassen, Einladungen und Reiseplänen hängt ein kleiner Drachenanhänger. Er erinnert daran, dass Verlässlichkeit und Fantasie einander nicht ausschließen.",
          "DaVinci1986 lacht gern mit, ohne dass jeder Moment zum völligen Chaos werden muss. Diese Balance macht ihre Wärme besonders: offen, freundlich und zugleich fest genug, um anderen Halt zu geben.",
        ],
      },
    ],
    worldText: [
      "Jede Tür des Hauses öffnet sich in eine andere Landschaft. Manche Wege führen über schneebedeckte Pässe, andere in warme Städte oder zu einem Zug, der bereits den Viadukt überquert.",
      "Im Zentrum liegt kein Kontrollraum, sondern ein gastfreundlicher Tisch. Rote und goldene Routen beginnen dort nicht mit einem Befehl, sondern mit einer offenen Einladung.",
    ],
    connectionTitle: "Wem sie Wege öffnet",
    connections: [
      { name: "Neue Mitglieder", text: "finden bei ihr nicht nur Informationen, sondern einen verständlichen ersten Platz in unserer Gemeinschaft." },
      { name: "Reisende", text: "bekommen Orientierung, Begleitung und genau so viel Unterstützung, wie sie wirklich benötigen." },
      { name: "Unser Führungsteam", text: "kann sich auf ihre bedachte, respektvolle und praktische Art verlassen." },
    ],
    closing: "DaVinci1986 zeigt, dass eine offene Tür erst dann wirklich einlädt, wenn dahinter jemand aufmerksam hinsieht.",
    theme: { accent: "#e98568", accentSoft: "#f4ca8a", glow: "rgba(190, 63, 58, .33)", surface: "#351923" },
  },
  {
    slug: "drachenherz",
    name: "Drachenherz",
    title: "Die Drachenstimme des grünen Schildes",
    world: "Der Hain der Drachenstimme",
    sigil: "⬢",
    heroImage: "/drachenhalle/brand/officer-drachenherz-world.webp",
    heroAlt: "Drachenherz in seinem schützenden Waldhain innerhalb einer überwachsenen Bastion",
    chapterImage: "/drachenhalle/brand/chronicle-drachenherz-camp.webp",
    chapterImageAlt: "Drachenherz bereitet unter seinem smaragdgrünen Schutzsegen Schild und Lager für Gefährten vor",
    chapterCaption: "Das Schwert bleibt in der Scheide. Schutz zeigt sich hier in reparierter Ausrüstung, gefüllten Bechern und sicheren Wegen nach Hause.",
    invitation: "Hinter efeubedeckten Mauern liegt ein Rastplatz, an dem Stärke nicht ausgestellt, sondern für andere eingesetzt wird.",
    opening: [
      "Der Hain war einmal eine Festung. Heute wachsen Kräuter zwischen den Steinen, am Feuer warten vorbereitete Plätze und über allem liegt ein smaragdener Schutzsegen.",
      "Drachenherz steht nicht vor diesem Ort, um bewundert zu werden. Er hält ihn offen. Wenn jemand Schutz braucht, tritt er vor; wenn etwas beschädigt ist, hilft er beim Wiederaufbau. Seine Stärke wirkt am deutlichsten in dem, was durch sie sicher weiterleben kann.",
    ],
    quote: "Setzt euch ans Feuer. Ich sehe noch einmal nach dem Weg.",
    traits: [
      { icon: "🛡", title: "Schutz", text: "Er stellt seine Kraft zwischen Gefahr und diejenigen, die ihm anvertraut sind." },
      { icon: "❧", title: "Fürsorge", text: "Kräuter, Reparaturen und kleine Handgriffe zeigen den weichen Kern hinter der Rüstung." },
      { icon: "◈", title: "Verlässlichkeit", text: "Er hilft auch dann, wenn daraus kein persönlicher Vorteil entsteht." },
    ],
    chapters: [
      {
        eyebrow: "Stärke als Versprechen",
        title: "Ein Schild ist für die Menschen dahinter da",
        paragraphs: [
          "Die dunkelgrüne Schuppenrüstung und das Drachenknochenschwert erzählen von einem kampferfahrenen Kleriker. Doch das Schwert bleibt meist in seiner Scheide. Drachenherz muss Stärke nicht ständig beweisen – entscheidend ist, dass sie im richtigen Moment verfügbar ist.",
          "Sein smaragdener Segen umfasst nicht nur ihn selbst. Er spannt sich über Feuerstelle, Wege und leere Plätze. Selbst dort, wo gerade niemand zu sehen ist, bereitet er Sicherheit für die Rückkehr seiner Gefährten vor.",
        ],
      },
      {
        eyebrow: "Zwischen Schuppen und Kräutern",
        title: "Der behutsame Kern des Beschützers",
        paragraphs: [
          "Neben reparierten Schilden liegen Pflanzenbücher, Salben und junge Setzlinge. Drachenherz behandelt diese Dinge nicht als Gegensatz zu seiner kämpferischen Seite. Bewahren, heilen und schützen gehören für ihn zur selben Aufgabe.",
          "Er spricht bedacht und stellt sich selten selbst in den Mittelpunkt. Sein trockener Humor und ruhige gemeinsame Stunden zeigen jedoch, dass hinter der standhaften Erscheinung eine zugängliche, gute Seele lebt.",
        ],
      },
    ],
    worldText: [
      "Waldwege laufen in der lebenden Bastion zusammen. Efeu hält alte Mauern, Wasser fällt über überwachsene Steine und jede Feuerstelle bietet mehr Plätze, als gerade benötigt werden.",
      "Auf einer Karte neben zwei gefüllten Bechern warten noch ungeklärte Wege. Manche Gespräche brauchen hier nicht viele Worte, um Vertrauen sichtbar zu machen.",
    ],
    connectionTitle: "Wen sein Schild einschließt",
    connections: [
      { name: "Anthlan", text: "teilt mit ihm ruhige Planung und jenes Vertrauen, das keine große Inszenierung benötigt." },
      { name: "Seine Gefährten", text: "finden im Hain vorbereitete Plätze, reparierte Ausrüstung und einen sicheren Rückweg." },
      { name: "Die Gemeinschaft", text: "erlebt seine Stärke nicht als Herrschaft, sondern als verlässlichen Schutz." },
    ],
    closing: "Drachenherz trägt die Stimme der Drachen nicht, um über andere zu sprechen. Er erinnert uns daran, dass wirkliche Stärke jemanden sicher nach Hause bringt.",
    theme: { accent: "#70bd7e", accentSoft: "#d9d28d", glow: "rgba(68, 159, 87, .34)", surface: "#173324" },
  },
  {
    slug: "helltrain",
    name: "Helltrain",
    title: "Der eiserne Feldkoch",
    world: "Das Haus der stillen Glut",
    sigil: "▰",
    heroImage: "/drachenhalle/brand/chronicle-helltrain-house.webp",
    heroAlt: "Helltrain zwischen Feldküche, Werkstatt und Einsatzkarte im Haus der stillen Glut",
    chapterImage: "/drachenhalle/brand/chronicle-helltrain-house.webp",
    chapterImageAlt: "Helltrain kocht und setzt zugleich den letzten Marker auf einer Geländekarte",
    chapterCaption: "Eine warme Mahlzeit, ein geprüfter Weg und ein reparierter Balken entstehen bei Helltrain aus derselben Haltung.",
    invitation: "Am Gebirgspass steht ein unvollendetes Steinhaus. Es ist Küche, Werkstatt, Einsatzraum und jener Ort, an dem aus rauer Arbeit verlässliche Wärme wird.",
    opening: [
      "Helltrain redet nicht viel. Im Haus der stillen Glut muss er das auch nicht. Der Ofen brennt, Werkzeuge liegen bereit, die Karte ist geprüft und am Tisch wartet bereits eine warme Schale.",
      "Seine Aufmerksamkeit zeigt sich in Handlungen. Er fragt, ob alles gut ist, hört auf die Antwort und kümmert sich anschließend um das, was getan werden muss. Aus Vorbereitung wird bei ihm eine stille Form von Fürsorge.",
    ],
    quote: "Alles gut? Dann esst erst einmal. Den Rest klären wir danach.",
    traits: [
      { icon: "♨", title: "Wärme", text: "Feuer und Essen geben der Gemeinschaft Halt, ohne viele Worte zu verlangen." },
      { icon: "⚒", title: "Handwerk", text: "Er repariert, baut und macht Dinge wieder tragfähig, damit andere sich darauf verlassen können." },
      { icon: "▦", title: "Vorbereitung", text: "Einfache, belastbare Pläne sind ihm lieber als jede unnötig komplizierte Lösung." },
    ],
    chapters: [
      {
        eyebrow: "Arbeit, die trägt",
        title: "Fürsorge ohne große Worte",
        paragraphs: [
          "Der schwere Herd ist das Zentrum des Hauses. Um ihn herum hängen Pfannen, Messer und Werkzeuge, sichtbar benutzt und sorgfältig gepflegt. Eine Mahlzeit ist hier kein dekoratives Detail. Sie sagt: Jemand hat an euch gedacht.",
          "Dasselbe gilt für einen erneuerten Balken oder eine sauber markierte Route. Helltrain schafft Bedingungen, unter denen andere ruhig weiterarbeiten können. Er braucht dafür weder Applaus noch eine große Ansprache.",
        ],
      },
      {
        eyebrow: "Der Plan am Feuer",
        title: "Verantwortung wird verteilt, nicht gesammelt",
        paragraphs: [
          "Auf dem langen Holztisch liegen Zutaten und Einsatzkarte nebeneinander. Helltrain ordnet Abläufe klar, bündelt Fragen und gibt Aufgaben an diejenigen, die sie am besten erfüllen können.",
          "Seine eiserne Beinprothese gehört selbstverständlich zu seiner Silhouette. Sie erzählt von überstandenen Wegen, ohne ihn auf sie zu reduzieren. Entscheidend bleibt, dass er steht, arbeitet und für die nächste Gruppe einen Platz vorbereitet.",
        ],
      },
    ],
    worldText: [
      "Das Steinhaus bleibt sichtbar unvollendet. Frischer Mörtel, neue Balken und eine noch nicht eingesetzte Tür zeigen, dass Wiederaufbau kein einzelner heroischer Moment ist, sondern viele ruhige Arbeitsschritte benötigt.",
      "Draußen verlieren sich Pfade im Nebel des Passes. Drinnen genügen Glut, Eisen und der Duft einer warmen Mahlzeit, um zu wissen, dass man angekommen ist.",
    ],
    connectionTitle: "Wer an seinem Feuer Platz findet",
    connections: [
      { name: "Die Einsatzgruppe", text: "erhält klare Informationen, einen belastbaren Plan und etwas Warmes vor dem Aufbruch." },
      { name: "Drachenherz", text: "ergänzt seine operative Vorbereitung durch übergreifende Kampfkoordination und Schutz." },
      { name: "Das Führungsteam", text: "kann darauf vertrauen, dass Helltrain notwendige Arbeit nicht einfach liegen lässt." },
    ],
    closing: "Helltrain baut keinen Ort, an dem alles makellos ist. Er baut einen, der morgen noch trägt.",
    theme: { accent: "#dc7a4b", accentSoft: "#ecd09a", glow: "rgba(187, 75, 43, .32)", surface: "#302018" },
  },
];

export const getCharacterChronicle = (slug: string) => characterChronicles.find((chronicle) => chronicle.slug === slug);
