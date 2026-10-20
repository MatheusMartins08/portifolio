/**
 * Columns for `count` items when at most `max` fit side by side, balanced so the rows come out as even
 * as they can: as few rows as `max` allows, then as few columns as fill them. 4 in up to 3 → 2 (2 + 2),
 * 5 in up to 3 → 3 (3 + 2), 3 in up to 2 → 2 (2 + 1). Whatever row is short goes last, centred.
 */
export function balancedColumns(count: number, max: number): number {
  if (count <= 0 || max <= 1) return 1;
  const rows = Math.ceil(count / max);
  return Math.ceil(count / rows);
}
