import Phaser from 'phaser';
import { createGameConfig } from './game/config';

window.onerror = (msg, src, line, col, err) => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#c00;color:#fff;font:14px monospace;padding:12px;z-index:9999;white-space:pre-wrap;';
  div.textContent = `ERROR: ${msg}\n${src}:${line}:${col}\n${err?.stack ?? ''}`;
  document.body.appendChild(div);
};

window.addEventListener('unhandledrejection', (e) => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:40px;left:0;width:100%;background:#900;color:#fff;font:14px monospace;padding:12px;z-index:9999;white-space:pre-wrap;';
  div.textContent = `UNHANDLED: ${e.reason}`;
  document.body.appendChild(div);
});

try {
  new Phaser.Game(createGameConfig());
} catch (e) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:80px;left:0;width:100%;background:#600;color:#fff;font:14px monospace;padding:12px;z-index:9999;white-space:pre-wrap;';
  div.textContent = `INIT ERROR: ${e}`;
  document.body.appendChild(div);
}
