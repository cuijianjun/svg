import CurveBusiness from './CurveBusiness';
import Label from './label';
import EventEmitter from 'event-emitter-es6';
import UserService from 'src/lib/svgGraffiti/api/graffiti_api';

const FUNCTIONS_CREATOR = {
  curve: CurveBusiness,
  eraser: CurveBusiness,
  label: Label,
};

export default class Sketchpad extends EventEmitter {
  constructor(sketchpad, scoreId) {
    super();
    this.sketchpad = sketchpad;
    this.sketchpadLength = sketchpad.length;
    this.scoreId = scoreId;
    this._userService = new UserService();
    this.functionsPool = {};
    this.bindEvent();
    this.notify('curve');
  }

  _registerEvents() {
    this.currentBusiness.destroy();
    this.currentBusiness.on('graffitiAction', obj => {
      if (!obj.type) {
        return false;
      }
      if (obj.type === 'eraser') {
        obj.scoreId = this.scoreId;
        this.deleteGraffiti(obj);
      } else if (obj.type === 'save') {
        obj.scoreId = this.scoreId;
        obj.totalPage = this.sketchpadLength;
        this.saveGraffiti(obj);
      }
      this.emit('graffitiAction', obj);
      // this.emit('modeChange', {});
    });

    this.currentBusiness.on('labelAction', obj => {
      if (!obj.type) {
        return false;
      }
      if (obj.type === 'addLabel') {
        this.addLabel(obj, this.scoreId);
      } else if (obj.type === 'moveLabel') {
        this.addLabel(obj, this.scoreId);
      } else if (obj.type === 'deleteLabel') {
        this.deleteLabel(obj, this.scoreId);
      }
      this.emit('labelAction', obj);
      this.emit('modeChange', {});
    });
  }

  empty() {
    this.sketchpad.innerHTML = '';
  }

  async deleteGraffiti(obj) {
    let data = await this._userService.deleteGraffiti(obj);
    if (data && data.meta.code !== 0) {
      throw Error(data.meta.msg);
    }
    console.log('deleteSuccessful');
  }

  async addLabel(obj, scoreId) {
    let param = {};
    param.score_id = scoreId;
    param['tag'] = obj;
    let data = await this._userService.addLabel(param);
    if (data && data.meta.code !== 0) {
      throw Error(data.meta.msg);
    }
    console.log('addLabelSuccessful');
  }

  async deleteLabel(obj, scoreId) {
    obj.score_id = scoreId;
    let data = await this._userService.deleteLabel(obj);
    if (data && data.meta.code !== 0) {
      throw Error(data.meta.msg);
    }
    console.log('deleteLabelSuccessful');
  }

  async saveGraffiti(obj) {
    let data = await this._userService.saveGraffiti(obj);
    if (data && data.meta.code !== 0) {
      throw Error(data.meta.msg);
    }
    console.log('saveSuccessful');
  }

  /**
   * 该接口由【PubSub消息管理中心】负责调用，画板组件在此接口处理接收到的消息类型
   * @param {String} mode label消息模式
   * @param {Object} entity 消息实体对象
   */
  notify(entity, mode = '1') {
    if (entity === 'curve' || entity === 'eraser') {
      if (!this.functionsPool['curve'] && !this.functionsPool['eraser']) {
        this.functionsPool['curve'] = this.functionsPool['eraser'] = new CurveBusiness(this.sketchpad);
      }
      this.functionsPool['curve'].setBusinessMode(entity === 'eraser' ?
        CurveBusiness.MODE.ERASER : CurveBusiness.MODE.CURVE);
    } else {
      if (!this.functionsPool[entity]) {
        this.functionsPool[entity] = new FUNCTIONS_CREATOR[entity](this.sketchpad);
      }
      if (entity === 'label' && mode) {
        this.functionsPool[entity]['currentMode'] = mode;
        this.emit('modeChange', {});
      }
    }
    this.currentBusiness = this.functionsPool[entity];
    this._registerEvents();
  }

  bindEvent() {
    const __self = this;
    for (let i = 0; i < this.sketchpad.length; i++) {
      this.sketchpad[i].ontouchstart = function (event) {
        __self.sketchpad = event.target;
        __self.currentBusiness && __self.currentBusiness.onmousedown && __self.currentBusiness.onmousedown(event);
      };
      this.sketchpad[i].ontouchmove = function (event) {
        __self.sketchpad = event.target;
        __self.currentBusiness && __self.currentBusiness.onmousemove && __self.currentBusiness.onmousemove(event);
      };
      this.sketchpad[i].ontouchend = function (event) {
        __self.sketchpad = event.target;
        __self.currentBusiness && __self.currentBusiness.onmouseup && __self.currentBusiness.onmouseup(event);
      };
      this.sketchpad[i].onclick = function (event) {
        __self.sketchpad = event.target;
        __self.currentBusiness && __self.currentBusiness.onclick && __self.currentBusiness.onclick(event);
      };
    }
  }
}
