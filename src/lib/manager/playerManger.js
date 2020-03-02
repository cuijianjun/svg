import $ from 'jquery';
import { Musvg, parseUrlParams, Raven, toFixed, utils } from '@theone/webscore';

import BaseManager from '../base/baseManager';

/**
 * support midi or sound
 */
export default class PlayerManger extends BaseManager {
  constructor (option) {
    super(option);
    this.isAutoOver = 0;
  }

  init (option) {
    super.init(option);
  }

  setMode (soundMode) {
    super.setMode(soundMode);
    this.musvg.enableVirtualDest();
  }

  buttonEvents () {
    super.buttonEvents();

    let that = this;
    $('#device-status').off('click').on('click', function () {
      if (that.view.user_version !== 1) {
        return false;
      }
      let reportReplayData = {
        song_name: that.scoreName,
        song_id: that.scoreId,
        fashenghuanjie: 'ai评测',
        album_name: '',
        step_name: '',
        step_type: '',
      };
      that.emit('onTrack', {
        eventName: 'ai_lianqin_status_click',
        jsonData: JSON.stringify(reportReplayData)
      });
      $('#deviceStatus').show();
      that.showPopUp();
    });
  }

  registerEvents () {
    super.registerEvents();

    let that = this;

    this.musvg._autoSubmit.on('submit', data => {
      this.view.stopPlay();
    });
  }

  async loadScore (scoreId) {
    if (!scoreId) {
      return;
    }
    utils.showLoading();
    this.scoreId = scoreId;
    await this.musvg.loadScore(scoreId).then((scoreMeta) => {
      this.setScoreName(scoreMeta.name);
      let data = {
        song_name: scoreMeta.name,
        song_id: scoreMeta.id,
        is_zuoye: false
      };
      this.emit('onTrack', {
        eventName: 'ai_ai_view',
        jsonData: JSON.stringify(data)
      });
    }).catch(() => {
      utils.showLoading('发生异常，请稍后', '关闭');
      this.view.stopPlay();
    }).finally(() => {
      $(this.svgContainer).css({
        'overflowY': 'scroll'
      });
    });
  };

  showDeviceLink(flag) {
    super.showDeviceLink();

    if (flag) {
      $('.device-status>div').removeClass().addClass('voice');
    } else {
      $('.device-status>div').removeClass().addClass('linked');
    }
  }

  showDeviceUnLink() {
    super.showDeviceUnLink();
    $('.device-status>div').removeClass().addClass('un_linked');
  }

  showPopUp() {
    // 有连接
    if (this.deviceInfo.supportsInput) {
      $('#_start').hide();
      // 支持声音识别
      if (this.deviceInfo.isSnd) {
        $('#soundStarted').show().siblings('p').hide();
        $('#disconnect').show().siblings('p').hide();
      } else {
        // 设备已连接
        $('#noSupport').show().siblings('p').hide();
        $('#connect').show().siblings('p').hide();
      }
    } else {
      // 啥也没连
      $('#disconnect').show().siblings('p').hide();
      $('#soundUnStared').show().siblings('p').hide();
      $('#_start').show();
    }
  }
}
