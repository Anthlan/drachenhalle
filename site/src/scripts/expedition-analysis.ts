export type ExpeditionPlayer = {
  rank: number; player: string; tag: string; alliance: string; server: number; points: number; source?: string;
};
export type AllianceOverview = {
  tag: string; alliance: string; server: number; members: number; capacity: number; power: number; level: number;
};
export const sumPoints = (players: readonly ExpeditionPlayer[]) => players.reduce((sum, player) => sum + player.points, 0);
export const share = (part: number, total: number) => total > 0 ? part / total : 0;
export function median(values: readonly number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
export function summarizePlayers(players: readonly ExpeditionPlayer[]) {
  const ordered = [...players].sort((a, b) => b.points - a.points || a.rank - b.rank);
  const points = sumPoints(ordered);
  return {
    players: ordered, count: ordered.length, points,
    average: ordered.length ? points / ordered.length : 0,
    median: median(ordered.map(player => player.points)),
    top1: share(sumPoints(ordered.slice(0, 1)), points),
    top5: share(sumPoints(ordered.slice(0, 5)), points),
    top10: share(sumPoints(ordered.slice(0, 10)), points),
  };
}
export const allianceKey = (player: Pick<ExpeditionPlayer, "server" | "tag">) => `${player.server}:${player.tag || "__none"}`;
export function analyzeExpedition(players: readonly ExpeditionPlayer[], overviews: readonly AllianceOverview[]) {
  const servers = [...new Set(players.map(player => player.server))].sort((a, b) => a - b).map(server => ({
    server, ...summarizePlayers(players.filter(player => player.server === server)),
  }));
  const groups = new Map<string, ExpeditionPlayer[]>();
  for (const player of players) {
    const key = allianceKey(player);
    groups.set(key, [...(groups.get(key) || []), player]);
  }
  // Include known alliances even when nobody from them appears in the complete leaderboard.
  for (const overview of overviews) if (!groups.has(allianceKey(overview))) groups.set(allianceKey(overview), []);
  const alliances = [...groups.entries()].map(([key, members]) => {
    const overview = overviews.find(item => allianceKey(item) === key);
    const sample = members[0] || overview!;
    const stats = summarizePlayers(members);
    const serverPoints = servers.find(item => item.server === sample.server)?.points || 0;
    return {
      key, tag: sample.tag, name: sample.tag === "DIE" ? "DIE" : (overview?.alliance || sample.alliance || "Ohne Allianzangabe"),
      server: sample.server, ...stats, members: overview?.members ?? null,
      capacity: overview?.capacity ?? null, power: overview?.power ?? null,
      participation: overview && overview.members > 0 ? stats.count / overview.members : null,
      pointsPerMember: overview && overview.members > 0 ? stats.points / overview.members : null,
      serverShare: share(stats.points, serverPoints),
    };
  }).sort((a, b) => b.points - a.points || a.key.localeCompare(b.key));
  return { servers, alliances, ...summarizePlayers(players) };
}
