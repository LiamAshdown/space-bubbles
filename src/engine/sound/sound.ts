import { Sound as PixiSound } from "@pixi/sound";
import { Assets } from "pixi.js";
import type { StorageService } from "../../game/service/storage-service";

export class Sound {
  private _volume = 1;
  private readonly _effects = new Set<PixiSound>();
  private _disableEffects = false;
  private _currentMusic: PixiSound | null = null;
  private _currentMusicName: string | null = null;
  private _disableMusic = false;
  private _wasMusicPlayingBeforeHidden = false;
  private readonly _storageService: StorageService;

  constructor(storageService: StorageService) {
    this._storageService = storageService;
    this._loadSettings();
    this._setupVisibilityListener();
  }

  private _loadSettings(): void {
    this._disableEffects = this._storageService.get<boolean>("disableEffects") ?? false;
    this._disableMusic = this._storageService.get<boolean>("disableMusic") ?? false;
    this._volume = this._storageService.get<number>("soundVolume") ?? 1;
  }

  private _setupVisibilityListener(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this._currentMusic?.isPlaying) {
          this._wasMusicPlayingBeforeHidden = true;
          this.pauseMusic();
        }
      } else if (this._wasMusicPlayingBeforeHidden) {
        this._wasMusicPlayingBeforeHidden = false;
        this.resumeMusic();
      }
    });
  }

  public play(name: string): void {
    if (this._disableEffects) {
      return;
    }

    try {
      const sound = Assets.get(`${name}.mp3`) as PixiSound;
      if (!sound) {
        console.warn(`Sound ${name} not found`);
        return;
      }

      this._effects.add(sound);
      sound.play({ volume: this._volume }, () => {
        this._effects.delete(sound);
      });
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
    }
  }

  public playMusic(name: string, loop = true): void {
    if (this._currentMusicName === name && this._currentMusic?.isPlaying) {
      return;
    }

    this.stopMusic();

    this._currentMusicName = name;

    if (this._disableMusic) {
      return;
    }

    try {
      const music = Assets.get(`${name}.mp3`) as PixiSound;
      if (!music) {
        console.warn(`Music ${name} not found`);
        return;
      }

      this._currentMusic = music;
      music.play({ volume: this._volume, loop });
    } catch (error) {
      console.error(`Error playing music ${name}:`, error);
    }
  }

  public stopMusic(): void {
    if (this._currentMusic) {
      this._currentMusic.stop();
      this._currentMusic = null;
      this._currentMusicName = null;
    }
  }

  public pauseMusic(): void {
    this._currentMusic?.pause();
  }

  public resumeMusic(): void {
    if (this._currentMusic && !this._currentMusic.isPlaying && !this._disableMusic) {
      this._currentMusic.resume();
    }
  }

  public toggleMusic(): void {
    this._disableMusic = !this._disableMusic;
    this._storageService.set("disableMusic", this._disableMusic);

    if (this._disableMusic) {
      this._currentMusic?.stop();
    } else if (this._currentMusicName) {
      this.playMusic(this._currentMusicName);
    }
  }

  public toggleEffects(): void {
    this._disableEffects = !this._disableEffects;
    this._storageService.set("disableEffects", this._disableEffects);

    if (this._disableEffects) {
      for (const soundEffect of this._effects) {
        soundEffect.stop();
      }
    }
  }

  public setVolume(volume: number): void {
    this._volume = volume;
    this._storageService.set("soundVolume", this._volume);

    if (this._currentMusic) {
      this._currentMusic.volume = this._volume;
    }
  }

  public getVolume(): number {
    return this._volume;
  }

  public isMusicEnabled(): boolean {
    return !this._disableMusic;
  }

  public isEffectsEnabled(): boolean {
    return !this._disableEffects;
  }
}
