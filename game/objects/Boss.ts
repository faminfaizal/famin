import Phaser from 'phaser';

export type BossAttack = 'slash' | 'defend' | 'ambush';

export interface AttackResult {
  attack: BossAttack;
  damage: number;
}

function createBossTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('boss')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  // Body (dark red/maroon)
  g.fillStyle(0x8b0000, 1); g.fillRect(8, 4, 48, 44);
  // Eyes — cute black dots with white shine
  g.fillStyle(0x000000, 1); g.fillCircle(21, 18, 7); g.fillCircle(43, 18, 7);
  g.fillStyle(0xffffff, 1); g.fillCircle(25, 14, 3); g.fillCircle(47, 14, 3);
  // Angry eyebrows
  g.fillStyle(0x000000, 1);
  g.fillRect(12, 6, 8, 4); g.fillRect(16, 8, 8, 4);
  g.fillRect(40, 6, 8, 4); g.fillRect(36, 8, 8, 4);
  // Mouth (frown)
  g.fillStyle(0x000000, 1); g.fillRect(18, 38, 28, 3); g.fillRect(14, 34, 4, 4); g.fillRect(46, 34, 4, 4);
  // Arms
  g.fillStyle(0x8b0000, 1); g.fillRect(0, 16, 8, 16); g.fillRect(56, 16, 8, 16);
  // Legs
  g.fillRect(14, 48, 12, 16); g.fillRect(38, 48, 12, 16);
  // Sword (right side)
  g.fillStyle(0xcccccc, 1); g.fillRect(60, 2, 8, 40);
  g.fillStyle(0xffd700, 1); g.fillRect(58, 38, 12, 6);
  g.fillStyle(0x8B4513, 1); g.fillRect(61, 44, 6, 14);
  g.generateTexture('boss', 72, 64);
  g.destroy();
}

export class Boss extends Phaser.GameObjects.Sprite {
  hp = 200;
  maxHp = 200;
  isDefending = false;
  private defendTimer = 0;
  private slashCooldown = 0;
  private defendCooldown = 0;
  private ambushCooldown = 0;
  private actionCallback: ((result: AttackResult) => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    createBossTexture(scene);
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    this.setDepth(5).setScale(1.2);
  }

  onAttack(cb: (result: AttackResult) => void) {
    this.actionCallback = cb;
  }

  update(delta: number) {
    const dt = delta / 1000;
    this.slashCooldown = Math.max(0, this.slashCooldown - dt);
    this.defendCooldown = Math.max(0, this.defendCooldown - dt);
    this.ambushCooldown = Math.max(0, this.ambushCooldown - dt);

    if (this.isDefending) {
      this.defendTimer -= dt;
      if (this.defendTimer <= 0) this.isDefending = false;
    }

    const available: BossAttack[] = [];
    if (this.slashCooldown <= 0) available.push('slash');
    if (this.defendCooldown <= 0) available.push('defend');
    if (this.ambushCooldown <= 0) available.push('ambush');

    if (available.length > 0 && Math.random() < dt * 0.8) {
      const attack = available[Math.floor(Math.random() * available.length)];
      this.doAttack(attack);
    }
  }

  private doAttack(attack: BossAttack) {
    if (attack === 'slash') {
      this.slashCooldown = 3;
      this.scene.tweens.add({ targets: this, x: this.x - 30, duration: 150, yoyo: true });
      this.actionCallback?.({ attack: 'slash', damage: Math.round(200 * 0.05) });
    } else if (attack === 'defend') {
      this.defendCooldown = 4;
      this.isDefending = true;
      this.defendTimer = 1.0;
      this.setTint(0x4488ff);
      this.scene.time.delayedCall(1000, () => this.clearTint());
      this.actionCallback?.({ attack: 'defend', damage: 0 });
    } else {
      this.ambushCooldown = 10;
      this.setTint(0xff4400);
      this.scene.time.delayedCall(500, () => this.clearTint());
      this.actionCallback?.({ attack: 'ambush', damage: Math.round(200 * 0.15) });
    }
  }

  takeDamage(dmg: number) {
    this.hp = Math.max(0, this.hp - dmg);
    this.setTint(0xffffff);
    this.scene.time.delayedCall(200, () => this.clearTint());
  }
}
