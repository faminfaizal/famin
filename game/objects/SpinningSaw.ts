import Phaser from 'phaser';
import { HUD_HEIGHT } from '../config';

const R = 14;
const TEXTURE_SIZE = (R + 8) * 2; // 44px

function createSawTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('saw')) return;
  const cx = TEXTURE_SIZE / 2;
  const cy = TEXTURE_SIZE / 2;
  const g = scene.make.graphics({});
  g.fillStyle(0x999999, 1);
  g.fillCircle(cx, cy, R);
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
  g.fillStyle(0xeeeeee, 0.55);
  g.fillCircle(cx - R * 0.35, cy - R * 0.35, R * 0.28);
  g.fillStyle(0x444444, 1);
  g.fillCircle(cx, cy, 4);
  g.generateTexture('saw', TEXTURE_SIZE, TEXTURE_SIZE);
  g.destroy();
}

export class SpinningSaw {
  private sprite: Phaser.Physics.Arcade.Image;
  private speed = 55;
  private lastDirX = 1;
  private lastDirY = 0;
  private blockCooldown = 0;
  readonly physicsObj: Phaser.Physics.Arcade.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    createSawTexture(scene);
    this.sprite = scene.physics.add.image(x, y, 'saw').setDepth(3);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCircle(R, TEXTURE_SIZE / 2 - R, TEXTURE_SIZE / 2 - R);
    body.allowGravity = false;
    body.setMaxVelocity(this.speed);
    this.physicsObj = this.sprite;

    // Random initial direction
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const d = dirs[Math.floor(Math.random() * 4)];
    this.lastDirX = d[0];
    this.lastDirY = d[1];
    this.sprite.setVelocity(this.lastDirX * this.speed, this.lastDirY * this.speed);

    scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 900,
      repeat: -1,
      ease: 'Linear',
    });
  }

  update(delta: number) {
    if (this.sprite.y < HUD_HEIGHT + R) {
      this.sprite.setY(HUD_HEIGHT + R + 2);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const actualSpeed = Math.sqrt(
      body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y
    );

    this.blockCooldown = Math.max(0, this.blockCooldown - delta);
    const isBlocked = actualSpeed < this.speed * 0.3 && this.blockCooldown <= 0;

    if (isBlocked) {
      this.blockCooldown = 150;
      // Randomly turn perpendicular — gives natural maze-patrolling behaviour
      if (this.lastDirX !== 0) {
        this.lastDirX = 0;
        this.lastDirY = Math.random() < 0.5 ? 1 : -1;
      } else {
        this.lastDirX = Math.random() < 0.5 ? 1 : -1;
        this.lastDirY = 0;
      }
      this.sprite.setVelocity(this.lastDirX * this.speed, this.lastDirY * this.speed);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
