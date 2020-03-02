import BaseManager from '../base/baseManager';
import $ from 'jquery';
import { utils } from '@theone/webscore';

export default class PlaybackManger extends BaseManager {
  init (option) {
    super.init(option);
  }

  setMode (soundMode) {
    super.setMode(soundMode);
    if (soundMode) {
      this.musvg.disableVirtualDest();
    } else {
      this.musvg.enableVirtualDest();
    }
  }

  buttonEvents () {
    super.buttonEvents();
  }

  registerEvents () {
    super.registerEvents();
  }
  async loadRecord (recordId) {
    console.log('!!!loadRecord:' + recordId);
    await this.musvg.loadRecord(recordId).then((RecordInfo) => {
      this.emit('ai_ranklist_ai_view', {});
      this.emit('onTrack', {
        eventName: 'ai_ai_report_replay',
        jsonData: JSON.stringify(reportReplayData)
      });
    }).catch(() => {
      utils.showLoading('发生异常，请稍后', '关闭');
      this.actor.stopPlayRecord();
    }).finally(() => {
      utils.hideLoading();
      $(this.svgContainer).css({
        'overflowY': 'scroll'
      });
    });
  }

  setRecordInfo (recordInfo) {
    this.recordInfo = recordInfo;
    this.actor.setRecordInfo(recordInfo);
  }
}
