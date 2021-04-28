import { Asset } from "../assets";

// wrapper for audio api
const canPlayAudio = false;

export default class Sound implements Asset {
  path: string;
  name: string;
  readonly elm: HTMLAudioElement;

  constructor(name: string, path: string, elm: HTMLAudioElement) {
    this.elm = elm;
    this.path = path;
    this.name = name;
  }

  public play() {
    //TODO: only play on the 2nd HMR load because the browser require the use to interact with the dom first before play

    // ATTEMPT TO PLAY AUDIO EVERY 1 SECONDS IF NOT ABLE TO PLAY
    // https://stackoverflow.com/questions/52163817/is-there-an-event-to-detect-when-user-interacted-with-a-page
    const tryToPlay = setInterval(() => {
      const playPromise = this.elm.play();
      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            // Automatic playback started!
            // Show playing UI.
            clearInterval(tryToPlay);
          })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
            console.info("User has not interacted with document yet.");
          });
      }
    }, 1000);
  }
}
