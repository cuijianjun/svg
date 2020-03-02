import $ from 'jquery';
import { toFixed } from '@theone/webscore';
import PlaybackManger from 'src/lib/manager/playbackManager';
import BasePlayer from '../base/basePlayer';

export default class PlaybackPlayer extends BasePlayer {
  constructor () {
    super();

    $(() => {
      this.SManger = new PlaybackManger({
        setLastCursorSubmit: false,
        recordId: this.recordId,
        view: this,
        mode: this.play_mode
      });

      this.SManger.on('scoreOnLoad', () => {
        this.checkAngle(this.SManger.musvg);
      });

      this.SManger.loadRecord(this.recordId);
      this.registerEvents();
      this.buttonEvents();
    });
  }

  registerEvents() {
    super.registerEvents();
    this.SManger.registerEvents();
  }

  buttonEvents () {
    super.buttonEvents();
    this.SManger.buttonEvents();

    $('#notice-playback-hint').unbind('click').click((event) => {
      event.stopPropagation();
      if (event.target.id === 'notice-playback-hint') {
        $('.notice').removeClass('zIndex');
        $('.notice-hint').removeClass('show');
      }
    });
  };
}
