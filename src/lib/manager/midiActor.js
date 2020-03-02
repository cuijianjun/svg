import { toFixed, utils } from '@theone/webscore';
import $ from 'jquery';

import BaseActor from 'src/lib/base/baseActor';

/**
 * support midi
 */
export default class MidiActor extends BaseActor {
  constructor (option, musvg) {
    super(option, musvg);
    this.device = null;
    this.autoSubmit = option.autoSubmit || false;
    this.setLastCursorSubmit = option.setLastCursorSubmit || false;
  }

  registerEvents () {
    super.registerEvents();

    this.musvg.off('recordPlayEnd');
    this.musvg.on('recordPlayEnd', () => {
      this.view._onStopPlayRecord();
    });

    this.musvg.off('submitResult');
    this.musvg.on('submitResult', recordInfo => {
      utils.hideLoading();
      this.emit('_submitResult', recordInfo);
    });
  }

  buttonEvents () {
    super.buttonEvents();

    console.log('_buttonEvents midi!!!');
    let that = this;
    $('.play #button-record-play').off('click').on('click', (e) => {
      $('#tips').hide();
      if (!that.scoreId || that.musvg.isPlayingSample) {
        return;
      }
      if (!this.musvg.device || !this.musvg.device.supportsInput) {
        $('#nolink').show();
        return;
      }
      this.musvg.dropPlay();
      this.view.startPlay();
      this.setCursorPosition(0);
      let data = {
        song_name: this.scoreName,
        song_id: this.scoreId,
        is_zuoye: false,
      };
      this.emit('onTrack', {
        eventName: 'ai_ai_start',
        jsonData: JSON.stringify(data)
      });
    });
  };

  startPlayRecord () {
    this.musvg.startPlayRecord();
    this.view._onStartPlayRecord();
  }

  resetAutoSubmitMode() {
    super.resetAutoSubmitMode();
    this.musvg.setLastCursorSubmit(this.setLastCursorSubmit);
    this.musvg.setAutoSubmit(this.autoSubmit);
  }
}
