import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Player, createPlayerTexture } from '../objects/Player';
import { Boss } from '../objects/Boss';
import { audioManager } from '../AudioManager';
import { Settings } from '../Settings';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

interface AttackButton {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  cooldownOverlay: Phaser.GameObjects.Rectangle;
  label: string;
  cooldown: number;
  maxCooldown: number;
  currentCooldown: number;
  width: number;
  height: number;
  damage: number;
  attackType: string;
}

export class BossFightScene extends Phaser.Scene {
  private player!: Player;
  private boss!: Boss;
  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private bossHpBar!: Phaser.GameObjects.Rectangle;
  private playerHpText!: Phaser.GameObjects.Text;
  private bossHpText!: Phaser.GameObjects.Text;
  private attackButtons: AttackButton[] = [];
  private isPlayerDefending = false;
  private playerDefendTimer = 0;
  private gameOver = false;

  constructor() {
    super({ key: 'BossFightScene' });
  }

  create() {
    this.gameOver = false;
    this.isPlayerDefending = false;
    this.playerDefendTimer = 0;
    this.attackButtons = [];

    audioManager.stopMusic();

    // Background - dark stone pattern
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2a2a2a);
    this.drawStonePattern();

    // Create player and boss
    createPlayerTexture(this);
    this.player = new Player(this, 150, 300);
    this.player.setScale(1.5);

    this.boss = new Boss(this, 620, 280);

    // Boss attacks player
    this.boss.onAttack((result) => {
      if (this.gameOver) return;
      audioManager.playBossAttack();

      if (result.attack === 'defend') {
        // Boss is defending - no damage to player
        this.showFloatingText(this.boss.x, this.boss.y - 60, 'DEFEND!', '#4488ff');
        return;
      }

      let dmg = result.damage;
      if (this.isPlayerDefending && (result.attack === 'slash' || result.attack === 'ambush')) {
        // Player defended: block damage, deal counter to boss
        this.boss.takeDamage(2);
        this.showFloatingText(this.player.x, this.player.y - 60, 'BLOCKED!', '#44ff44');
        this.showFloatingText(this.boss.x, this.boss.y - 60, '-2', '#ff8800');
        dmg = 0;
        this.updateBossHpBar();
      }

      if (dmg > 0) {
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.showFloatingText(this.player.x, this.player.y - 60, `-${dmg}`, '#ff2222');
        this.cameras.main.shake(150, 0.008);
        audioManager.playHit();
        this.updatePlayerHpBar();

        if (this.player.hp <= 0) {
          this.onGameOver();
        }
      }
    });

    // HUD
    this.createHUD();

    // Attack buttons
    this.createAttackButtons();

    // Arena title
    this.add.text(GAME_WIDTH / 2, 20, 'BOSS FIGHT', {
      ...TEXT_STYLE,
      fontSize: '22px',
      color: '#ff4444',
    }).setOrigin(0.5);

    // VS text
    this.add.text(GAME_WIDTH / 2, 290, 'VS', {
      ...TEXT_STYLE,
      fontSize: '36px',
      color: '#ffcc00',
    }).setOrigin(0.5);
  }

  private drawStonePattern() {
    const g = this.add.graphics();
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 14; c++) {
        const offset = r % 2 === 0 ? 0 : 28;
        g.fillStyle(0x333333, 1);
        g.fillRect(c * 57 + offset, r * 60, 55, 58);
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(c * 57 + offset + 2, r * 60 + 2, 51, 54);
      }
    }
  }

  private createHUD() {
    // Player HP bar area (bottom-left)
    const phY = GAME_HEIGHT - 100;
    this.add.rectangle(100, phY, 220, 60, 0x222222).setDepth(10);
    this.add.graphics().setDepth(11).lineStyle(2, 0x888888, 1).strokeRect(100 - 110, phY - 30, 220, 60);

    this.add.text(20, phY - 22, 'YOU', {
      ...TEXT_STYLE,
      fontSize: '16px',
      color: '#ffffff',
    }).setDepth(12);

    // HP track
    this.add.rectangle(100, phY + 4, 180, 20, 0x444444).setDepth(11);
    this.playerHpBar = this.add.rectangle(100 - 90, phY + 4, 180, 20, 0x22cc44)
      .setDepth(12)
      .setOrigin(0, 0.5);

    this.playerHpText = this.add.text(100, phY + 4, '200/200', {
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(13);

    // Boss HP bar area (top-right)
    const bhY = 55;
    this.add.rectangle(GAME_WIDTH - 120, bhY, 240, 60, 0x222222).setDepth(10);
    this.add.graphics().setDepth(11).lineStyle(2, 0x888888, 1).strokeRect(GAME_WIDTH - 240, bhY - 30, 240, 60);

    this.add.text(GAME_WIDTH - 235, bhY - 22, 'BOSS', {
      ...TEXT_STYLE,
      fontSize: '16px',
      color: '#ff4444',
    }).setDepth(12);

    // Boss HP track
    this.add.rectangle(GAME_WIDTH - 120, bhY + 4, 200, 20, 0x444444).setDepth(11);
    this.bossHpBar = this.add.rectangle(GAME_WIDTH - 220, bhY + 4, 200, 20, 0xcc2222)
      .setDepth(12)
      .setOrigin(0, 0.5);

    this.bossHpText = this.add.text(GAME_WIDTH - 120, bhY + 4, '200/200', {
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(13);
  }

  private createAttackButtons() {
    const buttons: Array<{ label: string; color: number; cooldown: number; damage: number; attackType: string; x: number }> = [
      { label: 'SLASH', color: 0xddaa00, cooldown: 3, damage: 10, attackType: 'slash', x: GAME_WIDTH - 350 },
      { label: 'DEFEND', color: 0x2255cc, cooldown: 4, damage: 0, attackType: 'defend', x: GAME_WIDTH - 210 },
      { label: 'AMBUSH', color: 0xcc3300, cooldown: 10, damage: 30, attackType: 'ambush', x: GAME_WIDTH - 70 },
    ];

    const btnY = GAME_HEIGHT - 60;
    const btnW = 120;
    const btnH = 80;

    for (const btnDef of buttons) {
      const container = this.add.container(btnDef.x, btnY).setDepth(15);
      const bg = this.add.rectangle(0, 0, btnW, btnH, btnDef.color).setInteractive({ useHandCursor: true });
      const border = this.add.graphics();
      border.lineStyle(3, 0x000000, 1);
      border.strokeRect(-btnW / 2, -btnH / 2, btnW, btnH);

      const emoji = btnDef.attackType === 'slash' ? '⚔️' : btnDef.attackType === 'defend' ? '🛡️' : '💥';
      const emojiText = this.add.text(0, -18, emoji, { fontSize: '22px' }).setOrigin(0.5);
      const labelText = this.add.text(0, 8, btnDef.label, {
        ...TEXT_STYLE,
        fontSize: '14px',
        color: '#000000',
      }).setOrigin(0.5);
      const cdText = this.add.text(0, 26, 'Ready!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
      }).setOrigin(0.5);

      // Cooldown overlay
      const cooldownOverlay = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0.6).setOrigin(0.5).setVisible(false);

      container.add([bg, border, emojiText, labelText, cdText, cooldownOverlay]);

      const attackBtn: AttackButton = {
        container,
        bg,
        cooldownOverlay,
        label: btnDef.label,
        cooldown: 0,
        maxCooldown: btnDef.cooldown * 1000,
        currentCooldown: 0,
        width: btnW,
        height: btnH,
        damage: btnDef.damage,
        attackType: btnDef.attackType,
      };
      this.attackButtons.push(attackBtn);

      bg.on('pointerdown', () => {
        if (this.gameOver || attackBtn.currentCooldown > 0) return;
        this.doPlayerAttack(attackBtn);
      });
      bg.on('pointerover', () => {
        if (attackBtn.currentCooldown <= 0) bg.setAlpha(0.85);
      });
      bg.on('pointerout', () => bg.setAlpha(1));

      // Store reference to cd text
      (attackBtn as any).cdText = cdText;
      (attackBtn as any).labelText = labelText;
    }
  }

  private doPlayerAttack(btn: AttackButton) {
    if (btn.attackType === 'defend') {
      // Activate defend
      this.isPlayerDefending = true;
      this.playerDefendTimer = 1000;
      this.player.setTint(0x4488ff);
      btn.currentCooldown = btn.maxCooldown;
      this.showFloatingText(this.player.x, this.player.y - 60, 'DEFENDING!', '#4488ff');
      audioManager.playButton();
    } else {
      let dmg = btn.damage;
      let actualDmg = dmg;

      if (this.boss.isDefending) {
        // Boss defended: boss takes full damage but player takes counter 2 HP
        this.player.hp = Math.max(0, this.player.hp - 2);
        this.showFloatingText(this.player.x, this.player.y - 60, 'Counter! -2', '#ff8800');
        this.updatePlayerHpBar();
        if (this.player.hp <= 0) {
          this.boss.takeDamage(actualDmg);
          this.onGameOver();
          return;
        }
      }

      this.boss.takeDamage(actualDmg);
      this.showFloatingText(this.boss.x, this.boss.y - 60, `-${actualDmg}`, '#ffcc00');
      audioManager.playButton();

      // Slash animation - player moves forward
      if (btn.attackType === 'slash') {
        this.tweens.add({ targets: this.player, x: this.player.x + 40, duration: 120, yoyo: true });
      } else if (btn.attackType === 'ambush') {
        this.cameras.main.shake(100, 0.01);
        this.tweens.add({ targets: this.player, x: this.player.x + 60, duration: 100, yoyo: true });
      }

      btn.currentCooldown = btn.maxCooldown;
      this.updateBossHpBar();

      if (this.boss.hp <= 0) {
        this.onVictory();
      }
    }

    if (this.player.hp <= 0) {
      this.onGameOver();
    }
  }

  private updatePlayerHpBar() {
    const ratio = Math.max(0, this.player.hp / this.player.maxHp);
    this.playerHpBar.setSize(180 * ratio, 20);
    this.playerHpText.setText(`${this.player.hp}/${this.player.maxHp}`);
    // Color changes based on HP
    if (ratio > 0.5) this.playerHpBar.setFillStyle(0x22cc44);
    else if (ratio > 0.25) this.playerHpBar.setFillStyle(0xffaa00);
    else this.playerHpBar.setFillStyle(0xcc2222);
  }

  private updateBossHpBar() {
    const ratio = Math.max(0, this.boss.hp / this.boss.maxHp);
    this.bossHpBar.setSize(200 * ratio, 20);
    this.bossHpText.setText(`${this.boss.hp}/${this.boss.maxHp}`);
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y, text, {
      ...TEXT_STYLE,
      fontSize: '20px',
      color,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => t.destroy(),
    });
  }

  private onVictory() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.boss.setActive(false);
    audioManager.playVictory();
    audioManager.stopMusic();

    const settings = Settings.getInstance();
    if (settings.saveProgress) {
      settings.savedLevel = 1;
      settings.save();
    }

    this.time.delayedCall(1000, () => {
      this.scene.start('VictoryScene');
    });
  }

  private onGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.alive = false;
    this.player.setTint(0xff0000);
    audioManager.stopMusic();

    // Game over overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setDepth(25);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'GAME OVER', {
      ...TEXT_STYLE,
      fontSize: '56px',
      color: '#ff2222',
    }).setOrigin(0.5).setDepth(26);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'The boss was too powerful...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffcccc',
    }).setOrigin(0.5).setDepth(26);

    // Try again button
    const tryAgainBtn = this.add.container(GAME_WIDTH / 2 - 110, GAME_HEIGHT / 2 + 80).setDepth(26);
    const tryBg = this.add.rectangle(0, 0, 180, 50, 0xcc2222).setInteractive({ useHandCursor: true });
    const tryBorder = this.add.graphics();
    tryBorder.lineStyle(3, 0x000000, 1);
    tryBorder.strokeRect(-90, -25, 180, 50);
    const tryText = this.add.text(0, 0, 'TRY AGAIN', { ...TEXT_STYLE, fontSize: '18px' }).setOrigin(0.5);
    tryAgainBtn.add([tryBg, tryBorder, tryText]);
    tryBg.on('pointerdown', () => {
      audioManager.playButton();
      this.scene.start('BossFightScene');
    });

    // Main menu button
    const menuBtn = this.add.container(GAME_WIDTH / 2 + 110, GAME_HEIGHT / 2 + 80).setDepth(26);
    const menuBg = this.add.rectangle(0, 0, 180, 50, 0x444444).setInteractive({ useHandCursor: true });
    const menuBorder = this.add.graphics();
    menuBorder.lineStyle(3, 0x000000, 1);
    menuBorder.strokeRect(-90, -25, 180, 50);
    const menuText = this.add.text(0, 0, 'MAIN MENU', { ...TEXT_STYLE, fontSize: '18px' }).setOrigin(0.5);
    menuBtn.add([menuBg, menuBorder, menuText]);
    menuBg.on('pointerdown', () => {
      audioManager.playButton();
      this.scene.start('MainMenuScene');
    });
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    // Update boss AI
    this.boss.update(delta);

    // Player defend timer
    if (this.isPlayerDefending) {
      this.playerDefendTimer -= delta;
      if (this.playerDefendTimer <= 0) {
        this.isPlayerDefending = false;
        this.player.clearTint();
      }
    }

    // Update attack button cooldowns
    for (const btn of this.attackButtons) {
      if (btn.currentCooldown > 0) {
        btn.currentCooldown = Math.max(0, btn.currentCooldown - delta);
        const ratio = btn.currentCooldown / btn.maxCooldown;
        btn.cooldownOverlay.setVisible(true).setSize(btn.width, btn.height * ratio).setOrigin(0.5, 1).setY(btn.height / 2);

        const secs = Math.ceil(btn.currentCooldown / 1000);
        (btn as any).cdText.setText(`${secs}s`);

        if (btn.currentCooldown <= 0) {
          btn.cooldownOverlay.setVisible(false);
          (btn as any).cdText.setText('Ready!');
        }
      }
    }
  }
}
