import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { GameScene } from './scenes/GameScene';
import { BossWarningScene } from './scenes/BossWarningScene';
import { BossFightScene } from './scenes/BossFightScene';
import { VictoryScene } from './scenes/VictoryScene';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;
export const MAZE_COLS = 25;
export const MAZE_ROWS = 17;
export const HUD_HEIGHT = 56;
export const PLAYER_SPEED = 160;

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [MainMenuScene, SettingsScene, GameScene, BossWarningScene, BossFightScene, VictoryScene],
  };
}
