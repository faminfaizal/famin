export interface MazeData {
  grid: number[][];        // 0=floor, 1=wall
  cols: number;
  rows: number;
  playerStart: { col: number; row: number };
  candyPos: { col: number; row: number };
  floorTiles: { col: number; row: number }[];
}

class SeededRandom {
  private s: number;
  constructor(seed: number) { this.s = seed | 0; }
  next(): number {
    this.s = Math.imul(1664525, this.s) + 1013904223 | 0;
    return (this.s >>> 0) / 4294967296;
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

export function generateMaze(cols: number, rows: number, seed: number): MazeData {
  // cols and rows MUST be odd
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1));
  const rng = new SeededRandom(seed);
  const cellCols = (cols - 1) / 2;
  const cellRows = (rows - 1) / 2;
  const visited = Array.from({ length: cellRows }, () => Array(cellCols).fill(false));

  function dfs(cc: number, cr: number) {
    visited[cr][cc] = true;
    grid[cr * 2 + 1][cc * 2 + 1] = 0;
    const dirs = rng.shuffle([[0, -1], [1, 0], [0, 1], [-1, 0]]);
    for (const [dc, dr] of dirs) {
      const nc = cc + dc, nr = cr + dr;
      if (nc >= 0 && nc < cellCols && nr >= 0 && nr < cellRows && !visited[nr][nc]) {
        grid[cr * 2 + 1 + dr][cc * 2 + 1 + dc] = 0;
        dfs(nc, nr);
      }
    }
  }
  dfs(0, 0);

  const floorTiles: { col: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) floorTiles.push({ col: c, row: r });
    }
  }

  return {
    grid,
    cols,
    rows,
    playerStart: { col: 1, row: 1 },
    candyPos: { col: cols - 2, row: rows - 2 },
    floorTiles,
  };
}
