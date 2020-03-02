import $ from 'jquery';

import PlayerManger from 'src/lib/manager/playerManger';
import BasePlayer from 'src/lib/base/basePlayer';

export default class Player extends BasePlayer {
  constructor () {
    super();
    console.log('Player');

    $(() => {
      this.SManger = new PlayerManger({
        setLastCursorSubmit: true,
        scoreId: this.scoreId,
        view: this,
      });

      this.buttonEvents();
      this.registerEvents();

      this.SManger.on('scoreOnLoad', () => {
        this.checkAngle(this.SManger.musvg);
      });

      this.SManger.on('lastRecordInfo', (recordInfo) => {
        console.log('lastRecordInfo!!!!');
        this.lastRecordInfo = recordInfo;
      });
      this.SManger.loadScore(this.scoreId);
    });

    // if count > 5
    this.count = localStorage.getItem('count') || 0;
    let _playback = localStorage.getItem('playback') || '0';
    if (_playback === '1') {
      localStorage.setItem('playback', '0');
      $('#tips').hide();
    } else {
      this.count = parseInt(this.count) + 1;
      localStorage.setItem('count', this.count);
      this._showTips();
    }
  }

  registerEvents() {
    super.registerEvents();
    this.SManger.registerEvents();
  }

  buttonEvents () {
    super.buttonEvents();
    this.SManger.buttonEvents();

    let that = this;
    $('.play #button-play').off('click').on('click', function () {
      if (that.scoreId && that.recordPlay) {
        return;
      }
      let data = {
        song_name: that.SManger.scoreName,
        song_id: that.scoreId,
        is_zuoye: false
      };
      that.emit('onTrack', {
        eventName: 'ai_ai_shiting',
        jsonData: JSON.stringify(data)
      });
      $(this).hide();
      $('#button-stop').show();
      that.SManger.musvg.startPlaySample();
    });

    $('#nolinkBtn').unbind('click').click(() => {
      $('#nolink').hide();
    });
  };

  setCursorPosition (position) {
    this.SManger.setCursorPosition(position);
  };

  _showTips () {
    if (this.count < 6) {
      $('#tips').show();
    }
  }

}
