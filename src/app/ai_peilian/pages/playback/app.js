import $ from 'jquery';
import { native } from '@theone/webscore';
import 'assets/styles/reset.less';
import './less/app.less';
import PlaybackPlayer from 'src/lib/playback/playbackPlayer';

class PlaybackApp extends PlaybackPlayer {
  constructor () {
    super();
    localStorage.setItem('playback', '1');
  };

  registerEvents () {
    super.registerEvents();
    this.SManger.on('onTrack', (obj) => {
      this.emit('onTrack', obj);
    });
  };

  buttonEvents() {
    super.buttonEvents();
  }

  // app端关闭音频
  stopAudio() {
    this.SManger.stopAudio();
  }
}

// the app singleton
let theApp = new PlaybackApp();

// init native bridge
native.init(theApp);

window.app = theApp;
window.jQuery = $;
