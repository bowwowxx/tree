// Missing account data must be clearly labeled rather than looking like a
// real GitHub username. Search, scene labels and profile panels share this.

export function nameForIndex(i: number): string {
  return `Account pending #${i + 1}`;
}
