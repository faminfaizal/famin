import Phaser from 'phaser';
import { Settings } from '../Settings';
import { audioManager } from '../AudioManager';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Background gradient using rectangles
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x87ceeb);
    // Gradient bands
    for (let i = 0; i < 10; i++) {
      const alpha = 0.05 + i * 0.02;
      const color = i % 2 === 0 ? 0x5599ff : 0x44aaff;
      this.add.rectangle(GAME_WIDTH / 2, (i / 10) * GAME_HEIGHT + GAME_HEIGHT / 20, GAME_WIDTH, GAME_HEIGHT / 10, color, alpha);
    }

    // Decorative maze tile borders
    this.drawDecorativeTiles();

    // Floating circles decoration
    const circleColors = [0xff4444, 0xffaa00, 0x44ff44, 0x4444ff, 0xff44ff, 0x44ffff];
    for (let i = 0; i < 12; i++) {
      const g = this.add.graphics();
      g.fillStyle(circleColors[i % circleColors.length], 0.18);
      const x = 50 + (i * 67) % (GAME_WIDTH - 100);
      const y = 50 + (i * 53) % (GAME_HEIGHT - 100);
      const r = 20 + (i * 13) % 30;
      g.fillCircle(x, y, r);
    }

    // Title
    const titleText = this.add.text(GAME_WIDTH / 2, 100, 'The Amazing Mazes', {
      ...TEXT_STYLE,
      fontSize: '40px',
    }).setOrigin(0.5);

    const subtitle1 = this.add.text(GAME_WIDTH / 2, 150, 'of Claudy!', {
      ...TEXT_STYLE,
      fontSize: '46px',
    }).setOrigin(0.5);

    // Add a fun shadow effect
    this.add.text(GAME_WIDTH / 2 + 3, 100 + 3, 'The Amazing Mazes', {
      ...TEXT_STYLE,
      fontSize: '40px',
      color: '#444444',
    }).setOrigin(0.5).setDepth(-1);
    this.add.text(GAME_WIDTH / 2 + 3, 150 + 3, 'of Claudy!', {
      ...TEXT_STYLE,
      fontSize: '46px',
      color: '#444444',
    }).setOrigin(0.5).setDepth(-1);

    titleText.setDepth(1);
    subtitle1.setDepth(1);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 205, 'Can you survive all 20 levels?', {
      ...TEXT_STYLE,
      fontSize: '20px',
    }).setOrigin(0.5);

    // Play button
    const settings = Settings.getInstance();
    const showContinue = settings.saveProgress && settings.savedLevel > 1;
    const playLabel = showContinue ? `Continue (Level ${settings.savedLevel})` : 'PLAY';
    const startLevel = showContinue ? settings.savedLevel : 1;

    this.createButton(GAME_WIDTH / 2, 300, playLabel, 0x22bb55, 200, 56, () => {
      audioManager.init();
      audioManager.playButton();
      audioManager.startMusic();
      this.scene.start('GameScene', { level: startLevel });
    });

    if (showContinue) {
      this.createButton(GAME_WIDTH / 2, 370, 'New Game', 0x44aa88, 200, 48, () => {
        audioManager.init();
        audioManager.playButton();
        audioManager.startMusic();
        this.scene.start('GameScene', { level: 1 });
      });
    }

    const settingsY = showContinue ? 440 : 380;
    this.createButton(GAME_WIDTH / 2, settingsY, 'SETTINGS', 0x2266cc, 200, 56, () => {
      audioManager.init();
      audioManager.playButton();
      this.scene.launch('SettingsScene');
    });

    // Level indicator if continuing
    if (showContinue) {
      this.add.text(GAME_WIDTH / 2, 510, `Progress saved at Level ${settings.savedLevel}`, {
        ...TEXT_STYLE,
        fontSize: '16px',
        color: '#333333',
      }).setOrigin(0.5);
    }

    // Decorative candy icons at bottom
    this.drawCandyDecorations();
  }

  private drawDecorativeTiles() {
    const g = this.add.graphics();
    const tileSize = 32;
    const wallColor = 0x885522;

    // Top border tiles
    for (let c = 0; c < Math.ceil(GAME_WIDTH / tileSize); c++) {
      g.fillStyle(wallColor, 0.5);
      g.fillRect(c * tileSize, 0, tileSize - 2, tileSize - 2);
      g.fillStyle(0xaa7733, 0.3);
      g.fillRect(c * tileSize, 0, tileSize - 2, 4);
      g.fillRect(c * tileSize, 0, 4, tileSize - 2);
    }

    // Bottom border tiles
    for (let c = 0; c < Math.ceil(GAME_WIDTH / tileSize); c++) {
      g.fillStyle(wallColor, 0.5);
      g.fillRect(c * tileSize, GAME_HEIGHT - tileSize, tileSize - 2, tileSize - 2);
    }

    // Left border tiles
    for (let r = 1; r < Math.ceil(GAME_HEIGHT / tileSize) - 1; r++) {
      g.fillStyle(wallColor, 0.5);
      g.fillRect(0, r * tileSize, tileSize - 2, tileSize - 2);
    }

    // Right border tiles
    for (let r = 1; r < Math.ceil(GAME_HEIGHT / tileSize) - 1; r++) {
      g.fillStyle(wallColor, 0.5);
      g.fillRect(GAME_WIDTH - tileSize, r * tileSize, tileSize - 2, tileSize - 2);
    }
  }

  private drawCandyDecorations() {
    const colors = [0xff2222, 0xffaa00, 0x22ff22, 0x2222ff, 0xff22ff];
    for (let i = 0; i < 5; i++) {
      const g = this.add.graphics();
      const cx = 160 + i * 120;
      const cy = GAME_HEIGHT - 32;
      g.fillStyle(colors[i], 0.7);
      g.fillCircle(cx, cy, 10);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(cx - 3, cy - 3, 4);
    }
  }

  private createButton(x: number, y: number, label: string, color: number, w: number, h: number, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({ useHandCursor: true });
    const border = this.add.graphics();
    border.lineStyle(3, 0x000000, 1);
    border.strokeRect(-w / 2, -h / 2, w, h);

    const text = this.add.text(0, 0, label, {
      ...TEXT_STYLE,
      fontSize: '22px',
    }).setOrigin(0.5);

    container.add([bg, border, text]);

    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.IntegerToColor(color).lighten(20).color);
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(color);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
    });

    return container;
  }
}
