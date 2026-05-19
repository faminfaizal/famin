import Phaser from 'phaser';
import { HUD_HEIGHT } from '../config';

const PUDDLE_SIZE = 96;              // 3×3 tiles (3 × TILE_SIZE 32px)
const DROP_CYCLE = 4500;             // ms between puddle spawns
const WARNING_DURATION = 1100;       // ms warning is shown before drop
const PUDDLE_LIFETIME = 8000;        // ms each puddle persists

interface Puddle {
  visual: Phaser.GameObjects.Graphics;
  cx: number;
  cy: number;
  life: number;
}

export class SlimeDrop {
  private scene: Phaser.Scene;
  private getPlayer: () => { x: number; y: number };
  private puddles: Puddle[] = [];
  private cycleTimer = 0;
  private inWarning = false;
  private warningTimer = 0;
  private dropX = 0;
  private dropY = 0;
  private warning: Phaser.GameObjects.Graphics | null = null;
  private warningTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, getPlayer: () => { x: number; y: number }) {
    this.scene = scene;
    this.getPlayer = getPlayer;
  }

  update(delta: number) {
    if (!this.inWarning) {
      this.cycleTimer += delta;
      if (this.cycleTimer >= DROP_CYCLE) {
        this.cycleTimer = 0;
        this.inWarning = true;
        this.warningTimer = 0;
        const p = this.getPlayer();
        this.dropX = p.x;
        this.dropY = p.y;
        this.showWarning();
      }
    } else {
      this.warningTimer += delta;
      // Track player during first half of warning window
      if (this.warningTimer < WARNING_DURATION * 0.5) {
        const p = this.getPlayer();
        this.dropX = p.x;
        this.dropY = p.y;
        this.warning?.setPosition(this.dropX, this.dropY);
      }
      if (this.warningTimer >= WARNING_DURATION) {
        this.inWarning = false;
        this.hideWarning();
        this.spawnPuddle(this.dropX, this.dropY);
      }
    }

    // Age puddles, fade in last 2s
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const pd = this.puddles[i];
      pd.life -= delta;
      if (pd.life < 2000) pd.visual.setAlpha(pd.life / 2000);
      if (pd.life <= 0) {
        pd.visual.destroy();
        this.puddles.splice(i, 1);
      }
    }
  }

  isPlayerOnSlime(px: number, py: number): boolean {
    const half = PUDDLE_SIZE / 2;
    return this.puddles.some(pd =>
      Math.abs(px - pd.cx) < half && Math.abs(py - pd.cy) < half
    );
  }

  private showWarning() {
    const half = PUDDLE_SIZE / 2;
    this.warning = this.scene.add.graphics().setDepth(8).setPosition(this.dropX, this.dropY);
    this.warning.lineStyle(3, 0xffff00, 1);
    this.warning.strokeRect(-half, -half, PUDDLE_SIZE, PUDDLE_SIZE);
    // Crosshair
    this.warning.lineStyle(2, 0xffff00, 0.7);
    this.warning.lineBetween(-half, 0, half, 0);
    this.warning.lineBetween(0, -half, 0, half);

    this.warningTween = this.scene.tweens.add({
      targets: this.warning,
      alpha: 0.15,
      duration: 180,
      yoyo: true,
      repeat: -1,
    });
  }

  private hideWarning() {
    this.warningTween?.stop();
    this.warningTween = null;
    this.warning?.destroy();
    this.warning = null;
  }

  private spawnPuddle(cx: number, cy: number) {
    // Clamp so puddle stays inside maze area
    const half = PUDDLE_SIZE / 2;
    const clampedX = Phaser.Math.Clamp(cx, half, 800 - half);
    const clampedY = Phaser.Math.Clamp(cy, HUD_HEIGHT + half, 600 - half);

    const g = this.scene.add.graphics().setDepth(2).setPosition(clampedX, clampedY);
    // Base slime
    g.fillStyle(0x33bb33, 0.82);
    g.fillRect(-half, -half, PUDDLE_SIZE, PUDDLE_SIZE);
    // Dark blobs
    g.fillStyle(0x229922, 0.6);
    g.fillCircle(-22, -18, 18);
    g.fillCircle(20, 10, 22);
    g.fillCircle(-10, 24, 15);
    g.fillCircle(28, -20, 13);
    // Shine highlights
    g.fillStyle(0x88ff88, 0.35);
    g.fillCircle(-28, -28, 10);
    g.fillCircle(14, -30, 7);
    // Drip edges
    g.fillStyle(0x33bb33, 0.9);
    g.fillTriangle(-half, half - 8, -half + 8, half, -half + 16, half - 8);
    g.fillTriangle(half - 16, half - 8, half - 8, half, half, half - 8);

    this.puddles.push({ visual: g, cx: clampedX, cy: clampedY, life: PUDDLE_LIFETIME });
  }

  destroy() {
    this.hideWarning();
    for (const pd of this.puddles) pd.visual.destroy();
    this.puddles = [];
  }
}
