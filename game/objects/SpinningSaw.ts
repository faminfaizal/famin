import Phaser from 'phaser';
import { HUD_HEIGHT } from '../config';

const R = 14;
const TEXTURE_SIZE = (R + 8) * 2; // 44px

function createSawTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('saw')) return;
  const cx = TEXTURE_SIZE / 2;
  const cy = TEXTURE_SIZE / 2;
  const g = scene.make.graphics({});
  // Grey base disc
  g.fillStyle(0x999999, 1);
  g.fillCircle(cx, cy, R);
  // Teeth
  g.fillStyle(0xcccccc, 1);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tx = cx + Math.cos(a) * (R + 7);
    const ty = cy + Math.sin(a) * (R + 7);
    const ax = cx + Math.cos(a - 0.32) * (R - 1);
    const ay = cy + Math.sin(a - 0.32) * (R - 1);
    const bx = cx + Math.cos(a + 0.32) * (R - 1);
    const by = cy + Math.sin(a + 0.32) * (R - 1);
    g.fillTriangle(ax, ay, bx, by, tx, ty);
  }
  // Shine
  g.fillStyle(0xeeeeee, 0.55);
  g.fillCircle(cx - R * 0.35, cy - R * 0.35, R * 0.28);
  // Centre bolt
  g.fillStyle(0x444444, 1);
  g.fillCircle(cx, cy, 4);
  g.generateTexture('saw', TEXTURE_SIZE, TEXTURE_SIZE);
  g.destroy();
}

export class SpinningSaw {
  private sprite: Phaser.Physics.Arcade.Image;
  private player: { x: number; y: number } | null = null;
  private speed = 55;
  private dirTimer = 0;
  private readonly DIR_INTERVAL = 420;
  readonly physicsObj: Phaser.Physics.Arcade.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    createSawTexture(scene);
    this.sprite = scene.physics.add.image(x, y, 'saw').setDepth(3);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    // Centre the circle hitbox inside the 44×44 texture
    body.setCircle(R, TEXTURE_SIZE / 2 - R, TEXTURE_SIZE / 2 - R);
    body.allowGravity = false;
    body.setMaxVelocity(this.speed);
    this.physicsObj = this.sprite;

    // Continuous spin via tween
    scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 900,
      repeat: -1,
      ease: 'Linear',
    });
  }

  setTarget(target: { x: number; y: number }) {
    this.player = target;
  }

  update(delta: number) {
    if (!this.player) return;
    // Keep saw within maze (not above HUD)
    if (this.sprite.y < HUD_HEIGHT + R) {
      this.sprite.setY(HUD_HEIGHT + R + 2);
    }
    this.dirTimer += delta;
    if (this.dirTimer >= this.DIR_INTERVAL) {
      this.dirTimer = 0;
      const dx = this.player.x - this.sprite.x;
      const dy = this.player.y - this.sprite.y;
      // Move in the dominant axis toward the player (Pacman ghost style)
      if (Math.abs(dx) >= Math.abs(dy)) {
        this.sprite.setVelocity(dx > 0 ? this.speed : -this.speed, 0);
      } else {
        this.sprite.setVelocity(0, dy > 0 ? this.speed : -this.speed);
      }
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
