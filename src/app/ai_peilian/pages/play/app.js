import $ from 'jquery';
import { utils, native, toFixed } from '@theone/webscore';
import 'assets/styles/reset.less';
import './less/app.less';

import Player from 'src/lib/play/player';

class PlayApp extends Player {
  constructor () {
    super();
    localStorage.setItem('serviceId', this.service_id || '3');
    localStorage.setItem('homework', '0'); // for ai homework service
  };

  buttonEvents() {
    super.buttonEvents();
  }

  registerEvents () {
    super.registerEvents();

    this.SManger.on('_submitResult', async (recordInfo) => {
      this._getSubmitResult(recordInfo);
    });
  };

  async _getSubmitResult(recordInfo) {
    $('#popup').show();
    utils.hideLoading();
  }

  async getSubmitResult(obj) {
    utils.hideLoading();
    if (obj.error_code || Number(obj.error_code) === 0) {
      utils.toast(obj.error_msg);
      return false;
    }
    this._getSubmitResult(obj);
  }

  // app端关闭音频
  stopAudio() {
    this.SManger.stopAudio();
  }
}
// the app singleton
let theApp = new PlayApp();

// init native bridge
native.init(theApp);
window.app = theApp;
