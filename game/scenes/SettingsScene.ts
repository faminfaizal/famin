import Phaser from 'phaser';
import { Settings } from '../Settings';
import { audioManager } from '../AudioManager';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontStyle: 'bold',
  color: '#000000',
};

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const settings = Settings.getInstance();

    // Semi-transparent overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setInteractive(); // Blocks clicks on background

    // Panel
    const panelW = 500;
    const panelH = 400;
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;

    this.add.rectangle(panelX, panelY, panelW, panelH, 0xffffff, 1);
    const borderG = this.add.graphics();
    borderG.lineStyle(4, 0x000000, 1);
    borderG.strokeRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH);

    // Title
    this.add.text(panelX, panelY - panelH / 2 + 30, 'SETTINGS', {
      ...TEXT_STYLE,
      fontSize: '30px',
    }).setOrigin(0.5);

    // Divider
    const divG = this.add.graphics();
    divG.lineStyle(2, 0x888888, 1);
    divG.lineBetween(panelX - panelW / 2 + 20, panelY - panelH / 2 + 60, panelX + panelW / 2 - 20, panelY - panelH / 2 + 60);

    // Track width
    const trackW = 280;
    const trackH = 16;
    const trackStartX = panelX - trackW / 2;

    // Music Volume
    const musicY = panelY - 100;
    this.add.text(panelX - 220, musicY - 12, 'Music Volume', {
      ...TEXT_STYLE,
      fontSize: '17px',
    }).setOrigin(0, 0.5);

    const musicTrack = this.add.rectangle(panelX + 30, musicY, trackW, trackH, 0xbbbbbb);
    const musicTrackX = panelX + 30 - trackW / 2;
    const musicHandleX = musicTrackX + settings.musicVolume * trackW;
    const musicHandle = this.add.rectangle(musicHandleX, musicY, 24, 30, 0x444444)
      .setInteractive({ draggable: true, useHandCursor: true });

    const musicValueText = this.add.text(panelX + 180, musicY, Math.round(settings.musicVolume * 100) + '%', {
      ...TEXT_STYLE,
      fontSize: '16px',
    }).setOrigin(0, 0.5);

    musicHandle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const clampedX = Phaser.Math.Clamp(dragX, musicTrackX, musicTrackX + trackW);
      musicHandle.setX(clampedX);
      const val = (clampedX - musicTrackX) / trackW;
      settings.musicVolume = val;
      audioManager.setMusicVolume(val);
      musicValueText.setText(Math.round(val * 100) + '%');
      settings.save();
    });

    // SFX Volume
    const sfxY = panelY - 30;
    this.add.text(panelX - 220, sfxY - 12, 'SFX Volume', {
      ...TEXT_STYLE,
      fontSize: '17px',
    }).setOrigin(0, 0.5);

    this.add.rectangle(panelX + 30, sfxY, trackW, trackH, 0xbbbbbb);
    const sfxTrackX = panelX + 30 - trackW / 2;
    const sfxHandleX = sfxTrackX + settings.sfxVolume * trackW;
    const sfxHandle = this.add.rectangle(sfxHandleX, sfxY, 24, 30, 0x444444)
      .setInteractive({ draggable: true, useHandCursor: true });

    const sfxValueText = this.add.text(panelX + 180, sfxY, Math.round(settings.sfxVolume * 100) + '%', {
      ...TEXT_STYLE,
      fontSize: '16px',
    }).setOrigin(0, 0.5);

    sfxHandle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const clampedX = Phaser.Math.Clamp(dragX, sfxTrackX, sfxTrackX + trackW);
      sfxHandle.setX(clampedX);
      const val = (clampedX - sfxTrackX) / trackW;
      settings.sfxVolume = val;
      audioManager.setSfxVolume(val);
      sfxValueText.setText(Math.round(val * 100) + '%');
      settings.save();
    });

    // Save Progress toggle
    const spY = panelY + 60;
    this.add.text(panelX - 220, spY, 'Save Progress:', {
      ...TEXT_STYLE,
      fontSize: '17px',
    }).setOrigin(0, 0.5);

    const toggleColor = () => settings.saveProgress ? 0x22bb55 : 0x888888;
    const toggleBg = this.add.rectangle(panelX + 60, spY, 80, 36, toggleColor())
      .setInteractive({ useHandCursor: true });
    const borderTg = this.add.graphics();
    borderTg.lineStyle(2, 0x000000, 1);
    borderTg.strokeRect(panelX + 60 - 40, spY - 18, 80, 36);

    const toggleText = this.add.text(panelX + 60, spY, settings.saveProgress ? 'ON' : 'OFF', {
      ...TEXT_STYLE,
      fontSize: '18px',
    }).setOrigin(0.5);

    toggleBg.on('pointerdown', () => {
      settings.saveProgress = !settings.saveProgress;
      toggleBg.setFillStyle(toggleColor());
      toggleText.setText(settings.saveProgress ? 'ON' : 'OFF');
      settings.save();
    });

    // Note about save progress
    this.add.text(panelX, spY + 30, 'When ON, your level progress is stored in your browser.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#555555',
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.container(panelX, panelY + panelH / 2 - 40);
    const closeBg = this.add.rectangle(0, 0, 140, 44, 0xcc2222).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(0, 0, 'CLOSE', {
      ...TEXT_STYLE,
      fontSize: '20px',
    }).setOrigin(0.5);
    const closeBorder = this.add.graphics();
    closeBorder.lineStyle(2, 0x000000, 1);
    closeBorder.strokeRect(-70, -22, 140, 44);
    closeBtn.add([closeBg, closeBorder, closeText]);

    closeBg.on('pointerdown', () => {
      audioManager.playButton();
      this.scene.stop();
    });
    closeBg.on('pointerover', () => { closeBg.setFillStyle(0xff4444); });
    closeBg.on('pointerout', () => { closeBg.setFillStyle(0xcc2222); });

    // Enable drag input
    this.input.setDraggable([musicHandle, sfxHandle]);
  }
}
