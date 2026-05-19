import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, TILE_SIZE } from '../config';

export class CrushingWall {
  private wall: Phaser.GameObjects.Rectangle;
  private physWall: Phaser.Physics.Arcade.Image;
  private speed: number;
  private velX: number;
  readonly wallObj: Phaser.Physics.Arcade.Image;

  private readonly minX: number;
  private readonly maxX: number;
  private readonly wallW: number;
  private readonly wallH: number;

  constructor(scene: Phaser.Scene, cooldownSeconds: number, levelSeed: number) {
    const mazeH = GAME_HEIGHT - HUD_HEIGHT;
    this.wallH = mazeH * 0.25;
    this.wallW = TILE_SIZE * 2;

    // Speed scales with difficulty (lower cd = faster). Range: ~60–100 px/s
    this.speed = 60 + Math.max(0, (3.0 - cooldownSeconds)) * 25;
    this.velX = this.speed;

    // Random Y position within maze bounds using level seed
    const rng = ((levelSeed * 9301 + 49297) % 233280) / 233280;
    const wallY = HUD_HEIGHT + this.wallH / 2 + rng * (mazeH - this.wallH);

    this.minX = this.wallW / 2;
    this.maxX = GAME_WIDTH - this.wallW / 2;

    if (!scene.textures.exists('px')) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture('px', 1, 1);
      g.destroy();
    }

    // Visual: red wall with dark stripes
    this.wall = scene.add.rectangle(this.minX, wallY, this.wallW, this.wallH, 0xcc0000).setDepth(5);

    // Physics body
    this.physWall = scene.physics.add.image(this.minX, wallY, 'px').setVisible(false).setDepth(5);
    const body = this.physWall.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.wallW, this.wallH);
    body.setImmovable(true);
    body.allowGravity = false;

    this.wallObj = this.physWall;
  }

  update(delta: number) {
    const dt = delta / 1000;
    let newX = this.wall.x + this.velX * dt;

    if (newX >= this.maxX) {
      newX = this.maxX;
      this.velX = -this.speed;
    } else if (newX <= this.minX) {
      newX = this.minX;
      this.velX = this.speed;
    }

    this.wall.x = newX;
    this.physWall.x = newX;
    (this.physWall.body as Phaser.Physics.Arcade.Body).reset(newX, this.physWall.y);
  }

  destroy() {
    this.wall.destroy();
    this.physWall.destroy();
  }
}
