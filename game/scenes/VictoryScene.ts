import Phaser from 'phaser';
import { Settings } from '../Settings';
import { audioManager } from '../AudioManager';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    // Bright gold/yellow background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffd700);

    // Gradient bands
    const g = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      g.fillStyle(0xffee55, 0.3);
      g.fillRect(0, i * (GAME_HEIGHT / 8), GAME_WIDTH, GAME_HEIGHT / 16);
    }

    // Starburst background decoration
    const starG = this.add.graphics();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r1 = 250;
      const r2 = 180;
      const x1 = GAME_WIDTH / 2 + Math.cos(angle) * r1;
      const y1 = GAME_HEIGHT / 2 + Math.sin(angle) * r1;
      const x2 = GAME_WIDTH / 2 + Math.cos(angle + Math.PI / 12) * r2;
      const y2 = GAME_HEIGHT / 2 + Math.sin(angle + Math.PI / 12) * r2;
      starG.fillStyle(0xffcc00, 0.4);
      starG.fillTriangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, x1, y1, x2, y2);
    }

    // Confetti everywhere
    this.spawnCelebrationConfetti();

    // Main title
    this.add.text(GAME_WIDTH / 2 + 3, 100 + 3, 'YOU WIN!', {
      ...TEXT_STYLE,
      fontSize: '72px',
      color: '#aa7700',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 100, 'YOU WIN! 🎉', {
      ...TEXT_STYLE,
      fontSize: '72px',
      color: '#000000',
    }).setOrigin(0.5);

    // Bounce animation on title
    const title = this.add.text(GAME_WIDTH / 2, 100, '', {
      fontSize: '1px',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title,
      y: 90,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 195, 'You defeated the boss and completed', {
      ...TEXT_STYLE,
      fontSize: '22px',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 228, 'all 20 levels!', {
      ...TEXT_STYLE,
      fontSize: '22px',
    }).setOrigin(0.5);

    // Decorative trophy
    const trophyG = this.add.graphics();
    this.drawTrophy(trophyG, GAME_WIDTH / 2, 320);

    // Stars/circles decoration
    const starColors = [0xff2222, 0xff8800, 0xffcc00, 0x22ff22, 0x2222ff, 0x8822ff];
    for (let i = 0; i < 18; i++) {
      const sg = this.add.graphics();
      sg.fillStyle(starColors[i % starColors.length], 0.9);
      const px = 30 + (i * 47 + 17) % (GAME_WIDTH - 60);
      const py = 30 + (i * 37 + 23) % (GAME_HEIGHT - 60);
      sg.fillCircle(px, py, 10);
      // Draw a simple 4-point star shape
      sg.fillRect(px - 2, py - 14, 4, 28);
      sg.fillRect(px - 14, py - 2, 28, 4);
    }

    // Play Again button
    this.createButton(GAME_WIDTH / 2 - 130, 480, 'PLAY AGAIN', 0x22bb55, 220, 56, () => {
      audioManager.playButton();
      audioManager.init();
      const settings = Settings.getInstance();
      if (settings.saveProgress) {
        settings.savedLevel = 1;
        settings.save();
      }
      audioManager.startMusic();
      this.scene.start('GameScene', { level: 1 });
    });

    this.createButton(GAME_WIDTH / 2 + 130, 480, 'MAIN MENU', 0x2266cc, 220, 56, () => {
      audioManager.playButton();
      this.scene.start('MainMenuScene');
    });

    // Play victory sound
    audioManager.init();
    audioManager.playVictory();
  }

  private drawTrophy(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    // Cup
    g.fillStyle(0xffd700, 1);
    g.fillRect(cx - 35, cy - 55, 70, 50);
    // Cup rim
    g.fillRect(cx - 45, cy - 55, 90, 12);
    // Handles
    g.fillRect(cx - 55, cy - 48, 12, 25);
    g.fillRect(cx + 43, cy - 48, 12, 25);
    // Stem
    g.fillRect(cx - 10, cy - 5, 20, 25);
    // Base
    g.fillRect(cx - 40, cy + 20, 80, 12);
    // Shine
    g.fillStyle(0xffffaa, 0.6);
    g.fillRect(cx - 25, cy - 50, 12, 25);
    g.fillRect(cx - 8, cy - 50, 5, 20);
  }

  private spawnCelebrationConfetti() {
    const colors = [0xff2222, 0xffcc00, 0x22ff22, 0x2222ff, 0xff22ff, 0x22ffff, 0xff8800, 0xffffff];

    // Spawn waves of confetti
    for (let wave = 0; wave < 3; wave++) {
      this.time.delayedCall(wave * 400, () => {
        for (let i = 0; i < 25; i++) {
          const g = this.add.graphics().setDepth(5);
          const color = colors[Math.floor(Math.random() * colors.length)];
          g.fillStyle(color, 1);

          // Randomize shape: rect or circle
          if (Math.random() > 0.5) {
            g.fillRect(-5, -3, 10, 6);
          } else {
            g.fillCircle(0, 0, 5);
          }

          const startX = Math.random() * GAME_WIDTH;
          const startY = -20;
          g.setPosition(startX, startY);

          this.tweens.add({
            targets: g,
            x: startX + (Math.random() - 0.5) * 200,
            y: GAME_HEIGHT + 20,
            rotation: Math.random() * Math.PI * 4,
            duration: 2000 + Math.random() * 2000,
            delay: Math.random() * 800,
            onComplete: () => g.destroy(),
          });
        }
      });
    }
  }

  private createButton(x: number, y: number, label: string, color: number, w: number, h: number, onClick?: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(10);
    const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({ useHandCursor: true });
    const border = this.add.graphics();
    border.lineStyle(3, 0x000000, 1);
    border.strokeRect(-w / 2, -h / 2, w, h);
    const text = this.add.text(0, 0, label, {
      ...TEXT_STYLE,
      fontSize: '22px',
    }).setOrigin(0.5);
    container.add([bg, border, text]);

    if (onClick) bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 80 });
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
    });
    return container;
  }
}
