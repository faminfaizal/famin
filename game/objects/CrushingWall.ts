import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, TILE_SIZE } from '../config';

export class CrushingWall {
  private scene: Phaser.Scene;
  private wall: Phaser.GameObjects.Rectangle;
  private physWall: Phaser.Physics.Arcade.Image;
  private cooldown: number;
  private timer = 0;
  private crushing = false;
  readonly wallObj: Phaser.Physics.Arcade.Image;

  constructor(scene: Phaser.Scene, cooldownSeconds: number) {
    this.scene = scene;
    this.cooldown = cooldownSeconds * 1000;
    const h = GAME_HEIGHT - HUD_HEIGHT;
    const w = TILE_SIZE * 3;

    // Ensure a small pixel texture exists for physics image
    if (!scene.textures.exists('px')) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture('px', 1, 1);
      g.destroy();
    }

    // Visual rectangle
    this.wall = scene.add.rectangle(-w / 2, HUD_HEIGHT + h / 2, w, h, 0xcc0000).setDepth(5);

    // Physics image at same position
    this.physWall = scene.physics.add.image(-w / 2, HUD_HEIGHT + h / 2, 'px').setVisible(false).setDepth(5);
    const body = this.physWall.body as Phaser.Physics.Arcade.Body;
    body.setSize(w, h);
    body.setImmovable(true);
    this.wallObj = this.physWall;
  }

  update(delta: number) {
    if (this.crushing) return;
    this.timer += delta;
    if (this.timer >= this.cooldown) {
      this.timer = 0;
      this.startCrush();
    }
  }

  private startCrush() {
    this.crushing = true;
    const h = GAME_HEIGHT - HUD_HEIGHT;
    const w = TILE_SIZE * 3;
    const targetX = GAME_WIDTH * 0.6;

    this.scene.tweens.add({
      targets: [this.wall, this.physWall],
      x: targetX,
      duration: 600,
      ease: 'Power2',
      onUpdate: () => {
        const body = this.physWall.body as Phaser.Physics.Arcade.Body;
        body.reset(this.physWall.x, this.physWall.y);
      },
      onComplete: () => {
        this.scene.time.delayedCall(500, () => {
          this.scene.tweens.add({
            targets: [this.wall, this.physWall],
            x: -w / 2,
            duration: 500,
            ease: 'Power1',
            onUpdate: () => {
              const body = this.physWall.body as Phaser.Physics.Arcade.Body;
              body.reset(this.physWall.x, this.physWall.y);
            },
            onComplete: () => { this.crushing = false; }
          });
        });
      }
    });
  }

  destroy() {
    this.wall.destroy();
    this.physWall.destroy();
  }
}
