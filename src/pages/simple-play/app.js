import $ from 'jquery';
import EventEmitter from 'event-emitter-es6';
import { parseUrlParams, toFixed, utils, Musvg, Raven } from '@theone/webscore';
import 'assets/styles/reset.less';
import './less/play.less';
import 'assets/styles/iconfont.less';
import VConsole from 'vconsole';
const env = process.env.NODE_ENV;

class PlayApp extends EventEmitter {

  constructor () {
    super();
    utils.hideLoading();
    let urlParams = parseUrlParams();
    this.scoreId = urlParams.score_id;
    this.userToken = 'MAGISTER_USER_1';
    localStorage.userToken = this.userToken;
    localStorage.serviceId = '3'; // for ai peilian
    this.svgContainer = document.getElementById('mb-main-container');
    this.musvg = new Musvg(this.svgContainer, {
      pageClassName: 'svg-page',
      autoSubmit: false,
    });

    // on document ready
    $(() => {
      let log = Raven;
      let vConsole = new VConsole();
      this._registerEvents();
      if (this.scoreId) {
        this.loadScore(this.scoreId);
      }
    });
  }

  _registerEvents () {

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

    // finish listen event
    this.musvg.on('samplePlayEnd', () => {
      this._onStopListen();
    });

    // score scroll event
    this.musvg.on('scroll', (obj) => {
      let scaleRate = this.svgContainer.clientWidth * 0.85 / 595;
      let scrollTop = (obj.pos * scaleRate) + obj.element.offsetTop - (80 * scaleRate);
      this.musvg.scrollScoreAuto($('.play-main'), scrollTop);
    });
  }

  async loadScore (scoreId) {
    utils.showLoading();
    await this.musvg.loadScore(scoreId).then((scoreMeta) => {
      this.emit('onLoadScore', {
        id: scoreMeta.id.toString(),
        name: scoreMeta.name,
      });
      console.log('Score loaded id = %s', scoreId);
    }).catch(e => {
      console.error(e);
      this.emit('onError', {
        type: 'load_score',
      });
    }).finally(() => {
      utils.hideLoading();
      $(this.svgContainer).css({
        'overflowY': 'scroll'
      });
    });
  }

  startRecord () {
    if (this.isRecording) {
      return;
    }
    if (this.musvg.isPlayingSample) {
      this.stopListen();
    }

    $('#info-play0').find('.iconfont').removeClass('icon-yinpinbofang');
    $('#info-play0').find('.iconfont').addClass('icon-yinpintingzhi');
    $('#info-play0').find('#start-play').text('结束演奏');

    this.musvg.dropPlay();
    this.setCursorPosition(0);
    this.emit('onStartRecord');
    this.isRecording = true;
  }

  async stopAndSubmitRecord () {
    if (!this.isRecording) {
      this.emit('onError', {
        type: 'no_record',
      });
      return;
    }
    $('#info-play0').find('.iconfont').removeClass('icon-yinpintingzhi');
    $('#info-play0').find('.iconfont').addClass('icon-yinpinbofang');
    $('#info-play0').find('#start-play').text('开始演奏');
    this.isRecording = false;
    this.emit('onStopRecord');

    this.musvg.submitPlay();
  }

  startListen () {
    if (this.musvg.isPlayingSample) {
      return;
    }
    if (this.isRecording) {
      this.cancelRecord();
    }

    $('#info-music0').find('.iconfont').removeClass('icon-yinpinbofang');
    $('#info-music0').find('.iconfont').addClass('icon-yinpintingzhi');
    $('#info-music0').find('span').text('结束播放');

    this.musvg.startPlaySample();
    this.emit('onStartListen');
  }

  stopListen () {
    if (!this.musvg.isPlayingSample) {
      return;
    }
    this.musvg.stopPlaySample();
    this.emit('onStopListen');
    this._onStopListen();
  }

  cancelRecord () {
    if (!this.isRecording) {
      return;
    }
    this.isRecording = false;
    this.emit('onStopRecord');
  }

  setCursorPosition (position) {
    this.musvg.setCursorPosition(position);
  }

  _onStopListen () {
    $('#info-music0').find('.iconfont').removeClass('icon-yinpintingzhi');
  }

}

// the app singleton
let theApp = new PlayApp();
window.playApp = theApp;
// init native bridge
// native.init(theApp);
