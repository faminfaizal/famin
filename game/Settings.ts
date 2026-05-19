const STORAGE_KEY = 'claudy_v1';

export class Settings {
  musicVolume: number = 0.5;
  sfxVolume: number = 0.5;
  saveProgress: boolean = false;
  savedLevel: number = 1;

  private static _instance: Settings | null = null;

  static getInstance(): Settings {
    if (!Settings._instance) {
      Settings._instance = new Settings();
      Settings._instance.load();
    }
    return Settings._instance;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        saveProgress: this.saveProgress,
        savedLevel: this.savedLevel,
      }));
    } catch (_e) {
      // ignore
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.musicVolume === 'number') this.musicVolume = data.musicVolume;
        if (typeof data.sfxVolume === 'number') this.sfxVolume = data.sfxVolume;
        if (typeof data.saveProgress === 'boolean') this.saveProgress = data.saveProgress;
        if (typeof data.savedLevel === 'number') this.savedLevel = data.savedLevel;
      }
    } catch (_e) {
      // ignore
    }
  }
}
