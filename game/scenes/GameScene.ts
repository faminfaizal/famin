import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, MAZE_COLS, MAZE_ROWS, HUD_HEIGHT } from '../config';
import { getLevelConfig, LevelConfig } from '../data/levelConfig';
import { generateMaze, MazeData } from '../utils/MazeGenerator';
import { Player } from '../objects/Player';
import { VirtualJoystick } from '../objects/VirtualJoystick';
import { SpinningSaw } from '../objects/SpinningSaw';
import { CrushingWall } from '../objects/CrushingWall';
import { SlimeDrop } from '../objects/SlimeDrop';
import { Settings } from '../Settings';
import { audioManager } from '../AudioManager';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

export class GameScene extends Phaser.Scene {
  private level!: number;
  private levelConfig!: LevelConfig;
  private mazeData!: MazeData;
  private player!: Player;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private candy!: Phaser.Physics.Arcade.Image;
  private joystick!: VirtualJoystick;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private saws: SpinningSaw[] = [];
  private crushingWall: CrushingWall | null = null;
  private levelText!: Phaser.GameObjects.Text;
  private slimeDrop: SlimeDrop | null = null;
  private candyCollected = false;
  private playerStartX = 0;
  private playerStartY = 0;
  private lives = 3;
  private heartTexts: Phaser.GameObjects.Text[] = [];
  private gameOverActive = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: number }) {
    this.level = data?.level ?? 1;
    this.candyCollected = false;
    this.saws = [];
    this.crushingWall = null;
    this.slimeDrop = null;
    this.lives = 3;
    this.heartTexts = [];
    this.gameOverActive = false;
  }

  create() {
    this.levelConfig = getLevelConfig(this.level);
    this.mazeData = generateMaze(MAZE_COLS, MAZE_ROWS, this.levelConfig.mazeSeed);

    this.createWallTexture();
    this.createCandyTexture();

    // Background for maze area
    this.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT + (GAME_HEIGHT - HUD_HEIGHT) / 2, GAME_WIDTH, GAME_HEIGHT - HUD_HEIGHT, 0x222222);

    // Draw floor tiles
    this.drawFloor();

    // Create wall physics group
    this.walls = this.physics.add.staticGroup();
    this.buildWalls();

    // Player start position
    this.playerStartX = this.mazeData.playerStart.col * TILE_SIZE + TILE_SIZE / 2;
    this.playerStartY = HUD_HEIGHT + this.mazeData.playerStart.row * TILE_SIZE + TILE_SIZE / 2;

    this.player = new Player(this, this.playerStartX, this.playerStartY);

    // Candy
    const candyX = this.mazeData.candyPos.col * TILE_SIZE + TILE_SIZE / 2;
    const candyY = HUD_HEIGHT + this.mazeData.candyPos.row * TILE_SIZE + TILE_SIZE / 2;
    this.candy = this.physics.add.image(candyX, candyY, 'candy').setDepth(4);
    (this.candy.body as Phaser.Physics.Arcade.Body).setSize(20, 20).setImmovable(true);

    // Candy pulse animation
    this.tweens.add({
      targets: this.candy,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Joystick — floating, only activates below the HUD
    this.joystick = new VirtualJoystick(this, HUD_HEIGHT);

    // Obstacles for level >= 5
    if (this.levelConfig.sawCount > 0) {
      this.placeSaws();
    }
    if (this.levelConfig.hasWall) {
      this.crushingWall = new CrushingWall(this, this.levelConfig.wallCooldown, this.levelConfig.mazeSeed, this.levelConfig.wallDiagonal);
      this.physics.add.overlap(this.player, this.crushingWall.wallObj, () => {
        this.onPlayerHit();
      });
    }

    if (this.levelConfig.hasSlime) {
      this.slimeDrop = new SlimeDrop(this, () => this.player);
    }

    // Physics colliders/overlaps
    this.physics.add.collider(this.player, this.walls);

    this.physics.add.overlap(this.player, this.candy, () => {
      if (!this.candyCollected) this.onCandyCollected();
    });

    // HUD
    this.createHUD();

    // Camera bounds
    this.physics.world.setBounds(0, HUD_HEIGHT, GAME_WIDTH, GAME_HEIGHT - HUD_HEIGHT);
  }

  private createWallTexture() {
    const key = `wall_${this.levelConfig.mazeColor.toString(16)}`;
    if (this.textures.exists(key)) {
      this.registry.set('wallTextureKey', key);
      return;
    }
    const g = this.make.graphics({ x: 0, y: 0 });
    const c = this.levelConfig.mazeColor;

    // Main wall color
    g.fillStyle(c, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Lighter top/left edge
    const lighterColor = Phaser.Display.Color.IntegerToColor(c).lighten(25).color;
    g.fillStyle(lighterColor, 1);
    g.fillRect(0, 0, TILE_SIZE, 3);
    g.fillRect(0, 0, 3, TILE_SIZE);

    // Darker bottom/right edge
    const darkerColor = Phaser.Display.Color.IntegerToColor(c).darken(25).color;
    g.fillStyle(darkerColor, 1);
    g.fillRect(0, TILE_SIZE - 3, TILE_SIZE, 3);
    g.fillRect(TILE_SIZE - 3, 0, 3, TILE_SIZE);

    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
    this.registry.set('wallTextureKey', key);
  }

  private createCandyTexture() {
    if (this.textures.exists('candy')) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    // Main candy ball
    g.fillStyle(0xff2244, 1);
    g.fillCircle(16, 16, 13);
    // Stripes
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(10, 10, 4, 12);
    g.fillRect(18, 10, 4, 12);
    // Twisted wrapper ends
    g.fillStyle(0xffcc00, 1);
    g.fillTriangle(2, 10, 2, 22, 8, 16);
    g.fillTriangle(30, 10, 30, 22, 24, 16);
    // Shine
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(10, 9, 4);
    g.generateTexture('candy', 32, 32);
    g.destroy();
  }

  private drawFloor() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x333333, 1);

    for (let r = 0; r < this.mazeData.rows; r++) {
      for (let c = 0; c < this.mazeData.cols; c++) {
        if (this.mazeData.grid[r][c] === 0) {
          g.fillRect(c * TILE_SIZE, HUD_HEIGHT + r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private buildWalls() {
    const wallKey = this.registry.get('wallTextureKey') as string;

    for (let r = 0; r < this.mazeData.rows; r++) {
      for (let c = 0; c < this.mazeData.cols; c++) {
        if (this.mazeData.grid[r][c] === 1) {
          const wx = c * TILE_SIZE + TILE_SIZE / 2;
          const wy = HUD_HEIGHT + r * TILE_SIZE + TILE_SIZE / 2;
          const wallImg = this.walls.create(wx, wy, wallKey) as Phaser.Physics.Arcade.Image;
          wallImg.setDepth(1);
          wallImg.refreshBody();
        }
      }
    }
    this.walls.refresh();
  }

  private placeSaws() {
    const playerCol = this.mazeData.playerStart.col;
    const playerRow = this.mazeData.playerStart.row;
    const candyCol = this.mazeData.candyPos.col;
    const candyRow = this.mazeData.candyPos.row;

    const candidates = this.mazeData.floorTiles.filter(t => {
      const distFromStart = Math.abs(t.col - playerCol) + Math.abs(t.row - playerRow);
      const distFromEnd = Math.abs(t.col - candyCol) + Math.abs(t.row - candyRow);
      return distFromStart > 6 && distFromEnd > 4;
    });

    let seedVal = this.levelConfig.mazeSeed + 12345;
    const shuffle = (arr: typeof candidates) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        seedVal = Math.imul(1664525, seedVal) + 1013904223 | 0;
        const j = (seedVal >>> 0) % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffled = shuffle(candidates);
    const count = Math.min(this.levelConfig.sawCount, shuffled.length);

    for (let i = 0; i < count; i++) {
      const tile = shuffled[i];
      const sx = tile.col * TILE_SIZE + TILE_SIZE / 2;
      const sy = HUD_HEIGHT + tile.row * TILE_SIZE + TILE_SIZE / 2;
      const saw = new SpinningSaw(this, sx, sy);
      this.saws.push(saw);

      this.physics.add.collider(saw.physicsObj, this.walls);
      this.physics.add.overlap(this.player, saw.physicsObj, () => {
        this.onPlayerHit();
      });
    }
  }

  private createHUD() {
    // HUD background bar
    this.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 0x111111)
      .setScrollFactor(0)
      .setDepth(10);

    // Level text — upper row
    this.levelText = this.add.text(16, 18, `Level ${this.level} / 20`, {
      ...TEXT_STYLE,
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);

    // Hearts — lower row (3 lives)
    for (let i = 0; i < 3; i++) {
      const ht = this.add.text(16 + i * 26, 56, '♥', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ff4444',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
      this.heartTexts.push(ht);
    }

    // Maze color indicator — center
    const colorCircle = this.add.graphics().setScrollFactor(0).setDepth(11);
    colorCircle.fillStyle(this.levelConfig.mazeColor, 1);
    colorCircle.fillCircle(GAME_WIDTH / 2, HUD_HEIGHT / 2, 12);
    this.add.text(GAME_WIDTH / 2, HUD_HEIGHT / 2, this.levelConfig.mazeColorName[0].toUpperCase(), {
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12);

    // Exit button
    const exitBg = this.add.rectangle(GAME_WIDTH - 104, HUD_HEIGHT / 2, 56, 36, 0x880000)
      .setScrollFactor(0).setDepth(11).setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH - 104, HUD_HEIGHT / 2, 'EXIT', {
      ...TEXT_STYLE,
      fontSize: '15px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
    exitBg.on('pointerdown', () => {
      audioManager.stopMusic();
      this.scene.start('MainMenuScene');
    });
    exitBg.on('pointerover', () => exitBg.setFillStyle(0xaa0000));
    exitBg.on('pointerout', () => exitBg.setFillStyle(0x880000));

    // Pause/Settings button
    const pauseBtn = this.add.container(GAME_WIDTH - 36, HUD_HEIGHT / 2).setScrollFactor(0).setDepth(11);
    const pauseBg = this.add.rectangle(0, 0, 52, 40, 0x333333).setInteractive({ useHandCursor: true });
    const pauseText = this.add.text(0, 0, '⏸', { fontSize: '22px' }).setOrigin(0.5);
    const pauseBorder = this.add.graphics();
    pauseBorder.lineStyle(2, 0x888888, 1);
    pauseBorder.strokeRect(-26, -20, 52, 40);
    pauseBtn.add([pauseBg, pauseBorder, pauseText]);

    pauseBg.on('pointerdown', () => { this.scene.launch('SettingsScene'); });
    pauseBg.on('pointerover', () => pauseBg.setFillStyle(0x555555));
    pauseBg.on('pointerout', () => pauseBg.setFillStyle(0x333333));

    // HUD divider line
    this.add.graphics().setScrollFactor(0).setDepth(10).lineStyle(2, 0x444444, 1).lineBetween(0, HUD_HEIGHT, GAME_WIDTH, HUD_HEIGHT);
  }

  private updateHeartsDisplay() {
    for (let i = 0; i < this.heartTexts.length; i++) {
      this.heartTexts[i].setColor(i < this.lives ? '#ff4444' : '#333333');
    }
  }

  private onCandyCollected() {
    if (this.candyCollected) return;
    this.candyCollected = true;

    audioManager.playCandyPickup();
    const candyX = this.candy.x;
    const candyY = this.candy.y;
    this.candy.destroy();

    this.spawnConfetti(candyX, candyY);

    this.tweens.add({
      targets: this.player,
      y: this.player.y - 20,
      duration: 200,
      yoyo: true,
      repeat: 1,
    });

    const completeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Level Complete!', {
      ...TEXT_STYLE,
      fontSize: '48px',
      color: '#ffff00',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 1800,
      delay: 600,
    });

    const settings = Settings.getInstance();
    if (settings.saveProgress) {
      settings.savedLevel = Math.max(settings.savedLevel, this.level + 1);
      settings.save();
    }

    this.time.delayedCall(2200, () => {
      if (this.level === 19) {
        this.scene.start('BossWarningScene');
      } else {
        this.scene.start('GameScene', { level: this.level + 1 });
      }
    });
  }

  private spawnConfetti(x: number, y: number) {
    const colors = [0xff2222, 0xffcc00, 0x22ff22, 0x2222ff, 0xff22ff, 0x22ffff, 0xff8800];
    for (let i = 0; i < 30; i++) {
      const g = this.add.graphics().setDepth(15);
      const color = colors[i % colors.length];
      g.fillStyle(color, 1);
      g.fillRect(-4, -4, 8, 8);
      g.setPosition(x, y);

      const angle = (Math.random() * Math.PI * 2);
      const speed = 80 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 100;

      this.tweens.add({
        targets: g,
        x: g.x + vx,
        y: g.y + vy + 150,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 900 + Math.random() * 600,
        ease: 'Quad.easeIn',
        onComplete: () => g.destroy(),
      });
    }
  }

  private onPlayerHit() {
    if (!this.player.alive || this.gameOverActive || this.candyCollected) return;
    audioManager.playDeath();
    this.lives--;
    this.updateHeartsDisplay();

    if (this.lives <= 0) {
      this.gameOverActive = true;
      this.player.alive = false;
      this.showGameOver();
      return;
    }

    this.player.die(() => {
      this.player.setPosition(this.playerStartX, this.playerStartY);
    });
  }

  private showGameOver() {
    const respawnLevel = Math.max(1, this.level - 1);
    let timeLeft = 10;

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
      .setDepth(25).setScrollFactor(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'GAME OVER', {
      ...TEXT_STYLE,
      fontSize: '54px',
      color: '#ff2222',
    }).setOrigin(0.5).setDepth(26).setScrollFactor(0);

    // Countdown label
    const countdownText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 38,
      `Restarting at Level 1 in ${timeLeft}s...`,
      { fontFamily: 'Arial, sans-serif', fontSize: '17px', color: '#ffaaaa' }
    ).setOrigin(0.5).setDepth(26).setScrollFactor(0);

    // Respawn button
    const btnY = GAME_HEIGHT / 2 + 32;
    const btnBg = this.add.rectangle(GAME_WIDTH / 2, btnY, 290, 60, 0x22aa55)
      .setDepth(26).setScrollFactor(0).setInteractive({ useHandCursor: true });
    this.add.graphics().setDepth(26).setScrollFactor(0)
      .lineStyle(3, 0x000000, 1)
      .strokeRect(GAME_WIDTH / 2 - 145, btnY - 30, 290, 60);
    this.add.text(GAME_WIDTH / 2, btnY, `Respawn at Level ${respawnLevel}`, {
      ...TEXT_STYLE,
      fontSize: '19px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(27).setScrollFactor(0);

    // Main menu button
    const menuY = btnY + 72;
    const menuBg = this.add.rectangle(GAME_WIDTH / 2, menuY, 200, 48, 0x444444)
      .setDepth(26).setScrollFactor(0).setInteractive({ useHandCursor: true });
    this.add.graphics().setDepth(26).setScrollFactor(0)
      .lineStyle(3, 0x000000, 1)
      .strokeRect(GAME_WIDTH / 2 - 100, menuY - 24, 200, 48);
    this.add.text(GAME_WIDTH / 2, menuY, 'Main Menu', {
      ...TEXT_STYLE,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(27).setScrollFactor(0);

    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        timeLeft--;
        if (timeLeft > 0) {
          countdownText.setText(`Restarting at Level 1 in ${timeLeft}s...`);
        } else {
          audioManager.stopMusic();
          this.scene.start('GameScene', { level: 1 });
        }
      },
    });

    btnBg.on('pointerdown', () => {
      countdownEvent.remove();
      audioManager.stopMusic();
      this.scene.start('GameScene', { level: respawnLevel });
    });
    btnBg.on('pointerover', () => btnBg.setFillStyle(0x33cc66));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x22aa55));

    menuBg.on('pointerdown', () => {
      countdownEvent.remove();
      audioManager.stopMusic();
      this.scene.start('MainMenuScene');
    });
    menuBg.on('pointerover', () => menuBg.setFillStyle(0x666666));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x444444));
  }

  update(_time: number, delta: number) {
    if (!this.player || !this.player.alive) return;
    if (this.candyCollected || this.gameOverActive) {
      this.player.stopMoving();
      return;
    }

    let dirX = 0;
    let dirY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      dirX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      dirX = 1;
    } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
      dirY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      dirY = 1;
    } else {
      const jx = this.joystick.dirX;
      const jy = this.joystick.dirY;
      if (Math.abs(jx) > 0.25 || Math.abs(jy) > 0.25) {
        if (Math.abs(jx) >= Math.abs(jy)) {
          dirX = jx > 0 ? 1 : -1;
        } else {
          dirY = jy > 0 ? 1 : -1;
        }
      }
    }

    this.player.slowed = false;
    if (this.slimeDrop) {
      this.slimeDrop.update(delta);
      this.player.slowed = this.slimeDrop.isPlayerOnSlime(this.player.x, this.player.y);
    }

    this.player.move(dirX, dirY);

    for (const saw of this.saws) {
      saw.update(delta);
    }
    if (this.crushingWall) {
      this.crushingWall.update(delta);
    }
  }
}
