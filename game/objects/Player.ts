import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config';

export function createPlayerTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('player')) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  // Body (orange)
  g.fillStyle(0xff8800, 1); g.fillRect(4, 2, 24, 22);
  // Eyes
  g.fillStyle(0xffffff, 1); g.fillRect(7, 5, 8, 8); g.fillRect(17, 5, 8, 8);
  g.fillStyle(0x000000, 1); g.fillRect(9, 7, 4, 4); g.fillRect(19, 7, 4, 4);
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
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len > 0.1) {
      this.setVelocity((dirX / len) * PLAYER_SPEED, (dirY / len) * PLAYER_SPEED);
      if (dirX < -0.1) this.setFlipX(true);
      else if (dirX > 0.1) this.setFlipX(false);
    } else {
      this.setVelocity(0, 0);
    }
  }

  stop() { this.setVelocity(0, 0); }

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
