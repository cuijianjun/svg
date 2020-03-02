import EventEmitter from 'event-emitter-es6';
import $ from 'jquery';

import { Musvg, utils } from '@theone/webscore';
import VConsole from 'vconsole';

import HomeworkApi from 'src/app/ai_peilian/api/homework-api';

import SoundActor from 'src/lib/manager/soundActor';
import MidiActor from 'src/lib/manager/midiActor';

export default class BaseManager extends EventEmitter {
  constructor (option) {
    super();
    this.view = option.view;

    this.init(option);
  }

  init (option) {
    this.svgContainer = document.getElementById('xm-main-container');
    this.musvg = new Musvg(this.svgContainer, Object.assign({
      pageClassName: 'svg-page',
      autoSubmit: false
    }, option));
    this.homeworkApi = new HomeworkApi();
    this.option = option;
    this.soundActor = new SoundActor(this.option, this.musvg);
    this.midiActor = new MidiActor(this.option, this.musvg);
    this.setMode(option.mode === 'sound' || false);
    let _console = process.env.HIDE_CONSOLE ? null : new VConsole();
  }

  setMode (soundMode) {
    if (this.actor) {
      this.actor.destroy();
    }
    if (soundMode) {
      console.log('sound mode');
      this.actor = this.soundActor;
      this.view.play_mode = 'sound';
    } else {
      console.log('midi mode');
      this.actor = this.midiActor;
      this.view.play_mode = 'midi';
    }
    this.showDeviceUnLink();

    this.actor.buttonEvents();
    this.actor.registerEvents();
    this.actor.resetAutoSubmitMode();
    this._resetActorEvents();
    utils.hideLoading();
  }

  buttonEvents () {
    this.actor.buttonEvents();
  }

  registerEvents () {
    this.actor.registerEvents();
    this.musvg.on('cursor', obj => {});

    this.musvg.on('exportSvgDome', () => {
      this.showTitle();
    });
  }

  showDeviceUnLink() {

  }

  showDeviceLink() {
  }

  showTitle() {
    this.view.showTitle();
  }

  setCursorPosition (position) {
    this.musvg.setCursorPosition(position);
  };

  setScoreName(scoreName) {
    this.scoreName = scoreName;
    this.midiActor.setScoreName(scoreName);
    this.soundActor.setScoreName(scoreName);
  }

  // app端关闭音频
  stopAudio() {
    this.musvg.stopPlayRecord();
    let dom = $('#record-audio');
    dom.length > 0 && dom[0].pause();
  }

  _resetActorEvents() {

    this.actor.on('_submitResult', recordInfo => {
      this.emit('_submitResult', recordInfo);
    });
  }
}
