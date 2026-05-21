import Phaser from 'phaser';

export class VirtualJoystick {
  dirX = 0;
  dirY = 0;
  private scene: Phaser.Scene;
  private baseX = 0;
  private baseY = 0;
  private maxDist = 45;
  private base: Phaser.GameObjects.Graphics;
  private knob: Phaser.GameObjects.Graphics;
  private active = false;
  private pid = -1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.base = scene.add.graphics().setDepth(20).setVisible(false).setScrollFactor(0);
    this.base.fillStyle(0x000000, 0.25);
    this.base.fillCircle(0, 0, 60);

    this.knob = scene.add.graphics().setDepth(21).setVisible(false).setScrollFactor(0);
    this.knob.fillStyle(0xaaaaaa, 0.85);
    this.knob.fillCircle(0, 0, 22);

    scene.input.on('pointerdown', this.down, this);
    scene.input.on('pointermove', this.move, this);
    scene.input.on('pointerup', this.up, this);
  }

  private down(p: Phaser.Input.Pointer) {
    if (!this.active) {
      this.active = true;
      this.pid = p.id;
      this.baseX = p.x;
      this.baseY = p.y;
      this.base.setPosition(p.x, p.y).setVisible(true);
      this.knob.setPosition(p.x, p.y).setVisible(true);
    }
  }

  private move(p: Phaser.Input.Pointer) {
    if (this.active && p.id === this.pid) this.updatePos(p.x, p.y);
  }

  private up(p: Phaser.Input.Pointer) {
    if (p.id === this.pid) {
      this.active = false;
      this.pid = -1;
      this.dirX = 0;
      this.dirY = 0;
      this.base.setVisible(false);
      this.knob.setVisible(false);
    }
  }

  private updatePos(px: number, py: number) {
    const dx = px - this.baseX;
    const dy = py - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.01) { this.dirX = 0; this.dirY = 0; return; }
    const clamped = Math.min(dist, this.maxDist);
    this.dirX = dx / dist;
    this.dirY = dy / dist;
    this.knob.setPosition(this.baseX + this.dirX * clamped, this.baseY + this.dirY * clamped);
  }

  destroy() {
    this.scene.input.off('pointerdown', this.down, this);
    this.scene.input.off('pointermove', this.move, this);
    this.scene.input.off('pointerup', this.up, this);
    this.base.destroy();
    this.knob.destroy();
  }
}
