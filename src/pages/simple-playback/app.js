import $ from 'jquery';
import EventEmitter from 'event-emitter-es6';
import { parseUrlParams, toFixed, utils, Musvg, native, Raven } from '@theone/webscore';
import 'assets/styles/reset.less';
import 'assets/styles/iconfont.less';
import './less/playback.less';
import VConsole from 'vconsole';

class PlaybackApp extends EventEmitter {
  constructor() {
    super();
    let urlParams = parseUrlParams();
    this.recordId = urlParams.recordId;
    localStorage.setItem('userToken', 'MAGISTER_USER_1');
    localStorage.setItem('serviceId', '3'); // for ai peilian
    this.svgContainer = document.getElementById('mb-main-container');
    this.device = null;
    this.isListening = false;
    // on document ready
    $(() => {
      let log = Raven;
      let vConsole = new VConsole();
      this.musvg = new Musvg(this.svgContainer, {
        pageClassName: 'svg-page',
        autoSubmit: false,
      });
      this._registerEvents();
      if (this.recordId) {
        this.loadRecord(this.recordId);
      }
    });
  }

  _registerEvents() {
    let that = this;
    // reload
    $('#startLoad').on('click', () => {
      console.log(this.musvg.isPlayingRecord);
      if (this.musvg.isPlayingRecord) {
        utils.toast('当前录音正在回放中，请稍后重新操作');
        return;
      }
      let value = $('#mytxt').val();
      that.loadRecord(value);
      $('#popup').hide();
      $('#switch').prop('checked', false);
    });

    this.musvg.on('deviceChange', (deviceInfo) => {
      if (deviceInfo.supportsInput) {
        $('#device-status .linked').removeClass('hide');
        $('#device-status .notlinked').addClass('hide');
      } else {
        $('#device-status .linked').addClass('hide');
        $('#device-status .notlinked').removeClass('hide');
      }
      this.emit('onDeviceChange', deviceInfo);
    });
  };

  loadRecord(recordId) {
    // load result
    this.musvg.loadRecord(recordId).then((result) => {
      this.recordId = result.recordId;
      $('#final').html(toFixed(this.summary.simple_final, 1));
    }).catch(e => {
      console.error(e);
      this.emit('onError', {
        type: 'load_record',
      });
    }).finally(() => {
      utils.hideLoading();
      $(this.svgContainer).css({
        'overflowY': 'scroll'
      });
    });
  }

  startListen() {
    if (this.musvg.isPlayingRecord) {
      return;
    }
    // if (!this.musvg.device || !this.musvg.device.supportsSound) {
    //   utils.alert('该功能需在连接The ONE智能设备时使用');
    //   this.emit('onError', {
    //     type: 'no_device',
    //   });
    //   return;
    // }
    $('#info-play0 i').removeClass('icon-yinpinbofang').addClass('icon-yinpintingzhi');
    this.musvg.startPlayRecord();
    this.emit('onStartListen');
  }

  stopListen() {
    if (!this.musvg.isPlayingRecord) {
      return;
    }
    this.musvg.stopPlayRecord();
    this._onStopListen();
  }

  _onStopListen() {
    $('#info-play0 i').removeClass('icon-yinpintingzhi').addClass('icon-yinpinbofang');
    this.emit('onStopListen', {});
  }
}

// the app singleton
let theApp = new PlaybackApp();

// init native bridge
native.init(theApp);

window.app = theApp;
