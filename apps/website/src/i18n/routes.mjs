// Stable route IDs separate the German editorial path from public translations.
// Put more specific routes before their parent area by relying on longest-prefix matching.
export const routes = [
  ...contentRoutes,
  { id: "home", paths: { de: "/", en: "/", fr: "/", ru: "/", pt: "/" } },
  { id: "tool.shield", paths: { de: "/tools/schildrechner/", en: "/tools/shield-planner/", fr: "/outils/planificateur-de-bouclier/", ru: "/инструменты/планировщик-щитов/", pt: "/ferramentas/planejador-de-escudos/" } },
  { id: "tool.healing", paths: { de: "/tools/heilrechner/", en: "/tools/healing-planner/", fr: "/outils/planificateur-de-soins/", ru: "/инструменты/планировщик-лечения/", pt: "/ferramentas/planejador-de-cura/" } },
  { id: "tool.event", paths: { de: "/tools/eventrechner/", en: "/tools/event-planner/", fr: "/outils/planificateur-evenement/", ru: "/инструменты/планировщик-события/", pt: "/ferramentas/planejador-de-evento/" } },
  { id: "tool.competition", paths: { de: "/tools/wettkampfplaner/", en: "/tools/competition-planner/", fr: "/outils/planificateur-de-competition/", ru: "/инструменты/планировщик-соревнования/", pt: "/ferramentas/planejador-de-competicao/" } },
  { id: "analysis.expedition", paths: { de: "/auswertungen/expeditionswahnsinn/", en: "/analyses/expedition-madness/", fr: "/analyses/folie-des-expeditions/", ru: "/анализы/экспедиционное-безумие/", pt: "/analises/loucura-das-expedicoes/" } },
  { id: "docs.alliance", paths: { de: "/docs/allianz/", en: "/guides/alliance/", fr: "/guides/alliance/", ru: "/руководства/альянс/", pt: "/guias/alianca/" } },
  { id: "docs.styleguides", paths: { de: "/docs/styleguides/", en: "/guides/style-guides/", fr: "/guides/guides-de-style/", ru: "/руководства/стили/", pt: "/guias/guias-de-estilo/" } },
  { id: "eventArchive", paths: { de: "/event-archiv/", en: "/event-archive/", fr: "/archives-evenements/", ru: "/архив-событий/", pt: "/arquivo-de-eventos/" } },
  { id: "hallOfFame", paths: { de: "/ruhmeshalle/", en: "/hall-of-fame/", fr: "/tableau-d-honneur/", ru: "/зал-славы/", pt: "/mural-da-fama/" } },
  { id: "council.map", paths: { de: "/rat/karte/", en: "/council/map/", fr: "/conseil/carte/", ru: "/совет/карта/", pt: "/conselho/mapa/" } },
  { id: "news", prefix: true, paths: { de: "/neuigkeiten/", en: "/news/", fr: "/actualites/", ru: "/новости/", pt: "/noticias/" } },
  { id: "calendar", prefix: true, paths: { de: "/termine/", en: "/calendar/", fr: "/calendrier/", ru: "/календарь/", pt: "/calendario/" } },
  { id: "gallery", prefix: true, paths: { de: "/galerie/", en: "/gallery/", fr: "/galerie/", ru: "/галерея/", pt: "/galeria/" } },
  { id: "council", prefix: true, paths: { de: "/rat/", en: "/council/", fr: "/conseil/", ru: "/совет/", pt: "/conselho/" } },
  { id: "chronicles", prefix: true, paths: { de: "/charakterchroniken/", en: "/character-chronicles/", fr: "/chroniques-des-personnages/", ru: "/хроники-персонажей/", pt: "/cronicas-de-personagens/" } },
  { id: "docs", prefix: true, paths: { de: "/docs/", en: "/guides/", fr: "/guides/", ru: "/руководства/", pt: "/guias/" } },
  { id: "tools", prefix: true, paths: { de: "/tools/", en: "/tools/", fr: "/outils/", ru: "/инструменты/", pt: "/ferramentas/" } },
  { id: "analyses", prefix: true, paths: { de: "/auswertungen/", en: "/analyses/", fr: "/analyses/", ru: "/анализы/", pt: "/analises/" } },
];

const normalized = value => {
  const clean = value.startsWith("/") ? value : `/${value}`;
  return clean === "/" ? clean : clean.replace(/\/+$/, "/");
};

const matchRoute = (pathname, language) => routes
  .filter(route => route.paths[language])
  .map(route => ({ route, routePath: normalized(route.paths[language]) }))
  .filter(({ route, routePath }) => route.prefix ? pathname.startsWith(routePath) : pathname === routePath)
  .sort((left, right) => right.routePath.length - left.routePath.length)[0];

export function translateRoutePath(pathname, fromLanguage, toLanguage) {
  const clean = normalized(pathname);
  const match = matchRoute(clean, fromLanguage);
  if (!match) return clean;
  const target = normalized(match.route.paths[toLanguage] ?? match.route.paths.de);
  return match.route.prefix ? target + clean.slice(match.routePath.length) : target;
}

export function routeId(pathname, language = "de") {
  return matchRoute(normalized(pathname), language)?.route.id ?? null;
}
import contentRoutes from "./content-routes.generated.mjs";

