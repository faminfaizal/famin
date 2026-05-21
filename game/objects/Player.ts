import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config';

export function createPlayerTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('player')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  // Body (orange)
  g.fillStyle(0xff8800, 1); g.fillRect(4, 2, 24, 22);
  // Eyes — cute black dots with white shine
  g.fillStyle(0x000000, 1); g.fillCircle(11, 9, 5); g.fillCircle(21, 9, 5);
  g.fillStyle(0xffffff, 1); g.fillCircle(13, 7, 2); g.fillCircle(23, 7, 2);
  // Eyebrows
  g.fillStyle(0x994400, 1); g.fillRect(7, 3, 8, 2); g.fillRect(17, 3, 8, 2);
  // Mouth (smile)
  g.fillStyle(0x000000, 1); g.fillRect(10, 18, 12, 2); g.fillRect(8, 16, 2, 2); g.fillRect(22, 16, 2, 2);
  // Arms
  g.fillStyle(0xff8800, 1); g.fillRect(0, 8, 4, 8); g.fillRect(28, 8, 4, 8);
  // Legs
  g.fillRect(7, 24, 6, 8); g.fillRect(19, 24, 6, 8);
  // Shoes
  g.fillStyle(0x884400, 1); g.fillRect(5, 30, 8, 4); g.fillRect(19, 30, 8, 4);
  g.generateTexture('player', 32, 34);
  g.destroy();
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp = 200;
  maxHp = 200;
  alive = true;
  slowed = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    createPlayerTexture(scene);
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    this.setCollideWorldBounds(false);
    (this.body as Phaser.Physics.Arcade.Body).setSize(24, 28).setOffset(4, 2);
  }

  move(dirX: number, dirY: number) {
    if (!this.alive) return;
    const speed = this.slowed ? PLAYER_SPEED * 0.5 : PLAYER_SPEED;
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len > 0.1) {
      this.setVelocity((dirX / len) * speed, (dirY / len) * speed);
      if (dirX < -0.1) this.setFlipX(true);
      else if (dirX > 0.1) this.setFlipX(false);
    } else {
      this.setVelocity(0, 0);
    }
  }

  stopMoving() { this.setVelocity(0, 0); }

  die(onRespawn: () => void) {
    if (!this.alive) return;
    this.alive = false;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(600, () => {
      this.clearTint();
      this.alive = true;
      onRespawn();
    });
  }
}
