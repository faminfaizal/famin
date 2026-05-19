export interface LevelConfig {
  level: number;
  mazeColor: number;
  mazeColorName: string;
  sawCount: number;
  hasWall: boolean;
  wallCooldown: number;
  mazeSeed: number;
}

export function getLevelConfig(level: number): LevelConfig {
  const colors = [
    { hex: 0xcc2222, name: 'red' },
    { hex: 0xdd6600, name: 'orange' },
    { hex: 0x2266cc, name: 'blue' },
  ];
  const c = colors[(level - 1) % 3];
  return {
    level,
    mazeColor: c.hex,
    mazeColorName: c.name,
    sawCount: level >= 5 ? (level - 4) : 0,
    hasWall: level >= 5,
    wallCooldown: level >= 5 ? Math.max(0.4, 3.0 - (level - 5) * 0.1) : 3.0,
    mazeSeed: level * 31337 + 999,
  };
}
