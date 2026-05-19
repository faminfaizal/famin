import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, TILE_SIZE } from '../config';

export class CrushingWall {
  private wall: Phaser.GameObjects.Rectangle;
  private physWall: Phaser.Physics.Arcade.Image;
  private speed: number;
  private velX: number;
  private velY: number;
  private readonly diagonal: boolean;
  private startDelay = 2200; // ms — starts off-screen for 2.2s so player can move away
  private started = false;
  readonly wallObj: Phaser.Physics.Arcade.Image;

  private readonly minX: number;
  private readonly maxX: number;
  private readonly minY: number;
  private readonly maxY: number;
  private readonly wallW: number;
  private readonly wallH: number;

  constructor(scene: Phaser.Scene, cooldownSeconds: number, levelSeed: number, diagonal: boolean) {
    this.diagonal = diagonal;
    const mazeH = GAME_HEIGHT - HUD_HEIGHT;
    this.wallH = mazeH * 0.25;
    this.wallW = TILE_SIZE * 2;

    // Speed scales with difficulty; diagonal splits evenly between axes
    this.speed = 65 + Math.max(0, (3.0 - cooldownSeconds)) * 22;
    const axisSp = diagonal ? this.speed * 0.72 : this.speed; // 0.72 ≈ 1/√2 keeps magnitude ~= speed
    this.velX = axisSp;
    this.velY = diagonal ? axisSp : 0;

    // Random Y using level seed — avoids spawning on the player's start row
    const rng = ((levelSeed * 9301 + 49297) % 233280) / 233280;
    const safeTop = HUD_HEIGHT + this.wallH / 2 + TILE_SIZE * 3; // leave 3 tiles gap at top (player start area)
    const safeBot = GAME_HEIGHT - this.wallH / 2 - TILE_SIZE;
    const wallY = safeTop + rng * (safeBot - safeTop);

    this.minX = this.wallW / 2;
    this.maxX = GAME_WIDTH - this.wallW / 2;
    this.minY = HUD_HEIGHT + this.wallH / 2;
    this.maxY = GAME_HEIGHT - this.wallH / 2;

    if (!scene.textures.exists('px')) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture('px', 1, 1);
      g.destroy();
    }

    // Start completely off-screen left; enters after startDelay
    const offX = -this.wallW;

    this.wall = scene.add.rectangle(offX, wallY, this.wallW, this.wallH, 0xcc0000).setDepth(5);

    this.physWall = scene.physics.add.image(offX, wallY, 'px').setVisible(false).setDepth(5);
    const body = this.physWall.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.wallW, this.wallH);
    body.setImmovable(true);
    body.allowGravity = false;

    this.wallObj = this.physWall;
  }

  update(delta: number) {
    if (!this.started) {
      this.startDelay -= delta;
      if (this.startDelay > 0) return;
      this.started = true;
      // Teleport onto left edge to begin patrol
      this.wall.x = this.minX;
      this.physWall.x = this.minX;
      (this.physWall.body as Phaser.Physics.Arcade.Body).reset(this.minX, this.physWall.y);
    }

    const dt = delta / 1000;
    let newX = this.wall.x + this.velX * dt;
    let newY = this.wall.y + this.velY * dt;

    if (newX >= this.maxX) { newX = this.maxX; this.velX = -Math.abs(this.velX); }
    else if (newX <= this.minX) { newX = this.minX; this.velX = Math.abs(this.velX); }

    if (this.diagonal) {
      if (newY >= this.maxY) { newY = this.maxY; this.velY = -Math.abs(this.velY); }
      else if (newY <= this.minY) { newY = this.minY; this.velY = Math.abs(this.velY); }
    }

    this.wall.x = newX;
    this.wall.y = newY;
    this.physWall.x = newX;
    this.physWall.y = newY;
    (this.physWall.body as Phaser.Physics.Arcade.Body).reset(newX, newY);
  }

  destroy() {
    this.wall.destroy();
    this.physWall.destroy();
  }
}
