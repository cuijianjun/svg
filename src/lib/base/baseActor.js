import EventEmitter from 'event-emitter-es6';
import $ from 'jquery';
import { toFixed } from '@theone/webscore';

export default class BaseActor extends EventEmitter {
  constructor (option, musvg) {
    super();

    this.view = option.view;
    this.scoreId = this.view.scoreId;

    this.musvg = musvg;
    this.wrong = 0;
    this.playing = 0;
    this.scoreName = null;
    this.recordInfo = null;
  }

  registerEvents () {
  }

  buttonEvents () {
  }

  resetAutoSubmitMode() {
  }

  setRecordInfo (recordInfo) {
    this.recordInfo = recordInfo;
  }

  setScoreName(scoreName) {
    this.scoreName = scoreName;
  }

  startPlayRecord () {
    this.musvg.startPlayRecord();
    this.view._onStartPlayRecord();
  }

  stopPlayRecord () {
    this.musvg.stopPlayRecord();
    this.view._onStopPlayRecord();
  }

  _onStopPlayRecord () {
    this.view._onStopPlayRecord();
  }

  setCursorPosition (position) {
    this.musvg.setCursorPosition(position);
  };

}
