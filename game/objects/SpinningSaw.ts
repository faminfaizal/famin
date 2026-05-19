import Phaser from 'phaser';

export class SpinningSaw extends Phaser.GameObjects.Container {
  body!: Phaser.Physics.Arcade.Body;
  private bladeGraphics: Phaser.GameObjects.Graphics;
  private rotAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const R = 14;
    const g = scene.add.graphics();
    // Base grey circle
    g.fillStyle(0x999999, 1);
    g.fillCircle(0, 0, R);
    // Teeth
    g.fillStyle(0xbbbbbb, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tx = Math.cos(a) * (R + 7);
      const ty = Math.sin(a) * (R + 7);
      const ax = Math.cos(a - 0.3) * (R - 1);
      const ay = Math.sin(a - 0.3) * (R - 1);
      const bx = Math.cos(a + 0.3) * (R - 1);
      const by = Math.sin(a + 0.3) * (R - 1);
      g.fillTriangle(ax, ay, bx, by, tx, ty);
    }
    // Shine
    g.fillStyle(0xeeeeee, 0.5);
    g.fillCircle(-R * 0.35, -R * 0.35, R * 0.3);
    // Dark center bolt
    g.fillStyle(0x555555, 1);
    g.fillCircle(0, 0, 4);

    this.bladeGraphics = g;
    this.add(g);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(R, -R, -R);
    body.setImmovable(true);
  }

  update(delta: number) {
    this.rotAngle += delta * 0.003;
    this.bladeGraphics.setRotation(this.rotAngle);
  }
}
