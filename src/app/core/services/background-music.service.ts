import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackgroundMusicService {
  readonly isPlaying = signal(false);

  private readonly audio = new Audio();
  private readonly source = '/partners/erika-marcha-alemana.mp3';

  constructor() {
    this.audio.preload = 'auto';
    this.audio.volume = 0.7;
    this.audio.loop = true;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('loadstart', () => {
      console.log('[BackgroundMusic] loadstart', this.audio.src);
    });

    this.audio.addEventListener('canplay', () => {
      console.log('[BackgroundMusic] canplay', this.audio.src);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
      console.log('[BackgroundMusic] play started');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
      console.log('[BackgroundMusic] pause');
    });

    this.audio.addEventListener('error', (event) => {
      console.error('[BackgroundMusic] audio failed', event);
      this.isPlaying.set(false);
    });
  }

  async toggle(): Promise<void> {
    if (this.isPlaying()) {
      this.audio.pause();
      this.audio.currentTime = 0;
      return;
    }

    const sourceUrl = new URL(this.source, window.location.origin).toString();
    console.log('[BackgroundMusic] using source', sourceUrl);

    this.audio.src = sourceUrl;
    this.audio.load();

    try {
      await this.audio.play();
      this.isPlaying.set(true);
      console.log('[BackgroundMusic] play promise resolved');
    } catch (error) {
      console.error('[BackgroundMusic] play promise rejected', error);
      this.isPlaying.set(false);
    }
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying.set(false);
  }
}
