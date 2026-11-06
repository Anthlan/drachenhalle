// Transcribed from Saisonplanung_2026_11_06.png. Addresses are planning references,
// not in-game coordinates. The capital covers J10:K11 in the source.
export const buildings = Object.fromEntries([
  [1, 'D G J M P S'], [2, 'A'], [3, 'C E G K O R'], [4, 'I M T'],
  [5, 'A E G P R'], [6, 'C I K N'], [7, 'E G P T'], [8, 'A I L N R'],
  [9, 'C G'], [10, 'E I L N P T'], [11, 'A R'],
  [12, 'F H K M O'], [13, 'C T'], [14, 'A E G J M P R'],
  [16, 'C F H J L N P T'], [17, 'A R'], [18, 'C F I L P'],
  [19, 'T'], [20, 'B E H K N Q'],
].flatMap(([row, columns]) => (columns as string).split(' ').map(column => {
  const code = `${column}${row}`;
  const level = column === 'T' || row === 1 || row === 2 || row === 20 || (column === 'A' && row !== 3) ? 1
    : row === 3 || row === 18 || column === 'R' || (column === 'C' && ![1, 20].includes(row as number)) ? 2
    : [4, 5, 7, 16].includes(row as number) || ['E10', 'P10', 'E14', 'P14'].includes(code) ? (code === 'J16' || code === 'G7' ? 4 : 3)
    : ['I8', 'L8', 'H12', 'M12', 'J14'].includes(code) ? 5
    : ['I10', 'L10', 'K12'].includes(code) ? 6 : 4;
  return [code, level];
}))) as Record<string, number>;

export const buildingNames: Record<number, string> = {
  1: 'Schutzraum', 2: 'Plündermarkt', 3: 'Wasserwerk', 4: 'Eisenfestung',
  5: 'Festungsarsenal', 6: 'Militärflugplatz', 7: 'Hauptstadt',
};
export function buildingName(code: string, level: number) {
  return code === 'L10' ? 'Raketenbasis' : code === 'K12' ? 'Kernkraftwerk' : buildingNames[level];
}
