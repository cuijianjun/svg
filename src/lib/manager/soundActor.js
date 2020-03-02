import $ from 'jquery';
import { browser, toFixed, Raven, utils } from '@theone/webscore';
import BaseActor from 'src/lib/base/baseActor';

/**
 * support sound
 */
export default class SoundActor extends BaseActor {
  constructor (option, musvg) {
    super(option, musvg);
    this.device = null;
    this.recordInfo = null;
    this.canPlay = true;
  }

  registerEvents () {
    super.registerEvents();

    this.musvg.off('recordPlayEnd');
    this.musvg.on('recordPlayEnd', () => {
      // this._onStopPlayRecord();
      this.setCursorPosition(0);
      this.canPlay = false;
    });
  }

  buttonEvents () {
    super.buttonEvents();
    let that = this;

    $('.play #button-record-play').off('click').on('click', (e) => {
      // 开始弹奏
      $('#tips').hide();
      that.startTime = +new Date() / 1000;
      if (!that.scoreId || that.musvg.isPlayingSample) {
        return;
      }
      if (that.musvg.device && (!that.musvg.device.supportsInput || !that.musvg.device.isSnd)) {
        $('#nolink').show();
        return;
      }
      that.view.startPlay();
      that.timer = setInterval(() => {
        let newTime = +new Date() / 1000;
        if (newTime - that.startTime > 600) {
          that.emit('stopAudioRecord', {});
          clearInterval(that.timer);
          utils.showLoading('加载中', '关闭');
        }
      }, 1000);
      that.emit('startAudioRecord', {});
      that.setCursorPosition(0);
      let data = {
        song_name: that.scoreName,
        song_id: that.scoreId,
        is_zuoye: false,
      };
      that.emit('onTrack', {
        eventName: 'ai_ai_start',
        jsonData: JSON.stringify(data)
      });
    });

  };

  resetAutoSubmitMode() {
    super.resetAutoSubmitMode();
    this.musvg.setLastCursorSubmit(false);
    this.musvg.setAutoSubmit(false);
  }
}
