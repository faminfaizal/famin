import Phaser from 'phaser';
import { Settings } from '../Settings';
import { audioManager } from '../AudioManager';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

export class BossWarningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossWarningScene' });
  }

  create() {
    audioManager.stopMusic();

    // Background: dark red/black gradient
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0000);
    // Radial dark overlay
    const g = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      const alpha = 0.08 - i * 0.008;
      g.fillStyle(0xff0000, alpha);
      g.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 80 + i * 60);
    }

    // Warning triangle (drawn)
    const triG = this.add.graphics();
    triG.fillStyle(0xffcc00, 1);
    triG.fillTriangle(GAME_WIDTH / 2, 40, GAME_WIDTH / 2 - 80, 170, GAME_WIDTH / 2 + 80, 170);
    triG.fillStyle(0x1a0000, 1);
    triG.fillTriangle(GAME_WIDTH / 2, 60, GAME_WIDTH / 2 - 60, 155, GAME_WIDTH / 2 + 60, 155);

    // "!" symbol inside triangle
    this.add.text(GAME_WIDTH / 2, 105, '!', {
      ...TEXT_STYLE,
      fontSize: '60px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Warning text
    this.add.text(GAME_WIDTH / 2, 200, 'WARNING!', {
      ...TEXT_STYLE,
      fontSize: '52px',
      color: '#ff2222',
    }).setOrigin(0.5);

    // Pulsing effect on warning text
    const warnText = this.add.text(GAME_WIDTH / 2, 200, 'WARNING!', {
      ...TEXT_STYLE,
      fontSize: '52px',
      color: '#ff4444',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: warnText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(GAME_WIDTH / 2, 265, 'There is a boss fight ahead.', {
      ...TEXT_STYLE,
      fontSize: '24px',
      color: '#ffaa00',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 305, 'Are you sure you want to continue?', {
      ...TEXT_STYLE,
      fontSize: '20px',
      color: '#ffcc88',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 345, 'You can adjust settings before the boss fight.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#cc9966',
    }).setOrigin(0.5);

    // PROCEED button
    this.createButton(GAME_WIDTH / 2 - 140, 430, 'PROCEED', 0xcc2222, 210, 56, '#ffcccc', () => {
      audioManager.playButton();
      this.scene.start('BossFightScene');
    });

    this.createButton(GAME_WIDTH / 2 + 110, 430, 'Save & Menu', 0x555555, 210, 56, '#dddddd', () => {
      audioManager.playButton();
      const s = Settings.getInstance();
      s.savedLevel = 19;
      s.save();
      this.scene.start('MainMenuScene');
    });

    this.createButton(GAME_WIDTH / 2, 510, 'SETTINGS', 0x2266cc, 160, 46, '#aaccff', () => {
      audioManager.playButton();
      this.scene.launch('SettingsScene');
    });
  }

  private createButton(x: number, y: number, label: string, bgColor: number, w: number, h: number, textColor = '#000000', onClick?: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, bgColor).setInteractive({ useHandCursor: true });
    const border = this.add.graphics();
    border.lineStyle(3, 0x000000, 1);
    border.strokeRect(-w / 2, -h / 2, w, h);
    const text = this.add.text(0, 0, label, {
      ...TEXT_STYLE,
      fontSize: '20px',
      color: textColor,
    }).setOrigin(0.5);
    container.add([bg, border, text]);

    if (onClick) bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
    });
    return container;
  }
}
