import EventEmitter from 'event-emitter-es6';
import Use from './Use';
import $ from 'jquery';
import { generateMixed, nodeToString, sliceNum } from 'lib/utils/tools';

export default class Label extends EventEmitter {

  constructor(sketchpad) {
    super();
    this.xOffset = 20;
    this.yOffset = 25;
    this.scale = 0.5;
    this.reset();
    this._registerEvents();
  }
  reset() {
    this._label = [];
    this.point = null;
    this.target = null;
    this.currentTargetPoint = null;
  }

  _registerEvents() {
    let _self = this;
    let obj = document.getElementsByTagName('object');

    for (let value of obj) {
      let _target = $(value.getSVGDocument().getElementById('labelContainer'));
      if (!_self.height && !_self.width) {
        const boundingClientRect = value.getSVGDocument().getElementsByTagName('svg')[0].getBoundingClientRect();
        _self.height = boundingClientRect.height;
        _self.width = boundingClientRect.width;
      }
      _target.on('touchmove', 'use', (ev) => {
        ev.stopPropagation();
        _self.useMove(ev);
      });
      _target.on('touchstart', 'use', (ev) => {
        ev.stopPropagation();
        console.log('start');
        _self.useStart(ev);
      });
      _target.on('touchend', 'use', (ev) => {
        ev.stopPropagation();
        console.log('touchend');
        _self.useEnd(ev);
      });
    }
  }

  toJson() {
    let ele = [], Json = [];
    let obj = document.getElementsByTagName('object');
    for (let value of obj) {
      let _target = $(value.getSVGDocument().getElementById('labelContainer'));
      ele = ele.concat(Array.from(_target.find('use')));
    }

    for (let value of ele) {
      let json = {};
      console.log(value.getAttribute('transform'));
      let origin = value.getAttribute('transform').split(' ');
      let pointObj = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(origin[0]);
      let scale = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(origin[1]);
      let point = pointObj[2].split(',');
      json.mode = value.getAttribute('xlink:href').substring(1);
      json.x = point[0];
      json.y = point[1];
      json.scale = scale[2];
      json._event = value;
      Json.push(json);
    }
    console.log(Json);
    return Json;
  }

  getPosition(event) {
    const boundingClientRect = event.target.getBoundingClientRect();
    let wid = document.body.clientWidth;
    let reatX = wid / 595;
    let reatY = boundingClientRect.height / 842;
    return {
      x: Number(((event.touches[0].clientX - boundingClientRect.left) / reatX).toFixed()),
      y: Number(((event.touches[0].clientY - boundingClientRect.top) / reatY).toFixed())
    };
  }

  get getBusinessMode() {
    return this.currentMode;
  }

  onmousedown(event) {
    event.stopPropagation();

    if (['path', 'use'].includes(event.target.nodeName)) {
      return;
    }
    let random = generateMixed(12);
    this.target = event.target.getElementById('labelContainer');
    this.point = this.getPosition(event);
    this._point = {
      x: this.point.x - this.xOffset,
      y: this.point.y - this.yOffset,
      mode: this.currentMode,
      Lid: random,
      page: event.target.parent._page.index,
      scale: this.currentMode === Label.MODE.BASHANDSIT ? 0.8 : this.scale
    };
    this.use = new Use({
      'xlink:href': '#' + this.currentMode,
      transform: `translate(${this._point.x},${this._point.y}) scale(${this._point.scale})`,
      Lid: random
    }).affix(this.target);
    // 同步学生端
    this.emit('labelAction', Object.assign(this._point, { type: 'addLabel' }));
  }

  onmousemove(event) {
    // 需要阻止默认行为，否则会导致fireEvent('mouseup')的时候导致onmousedown不执行
    event.stopPropagation();
  }

  onmouseup(event) {
  }

  useStart(event) {
    if (event.target.nodeName !== 'use') {
      return;
    }
    this.moveFlag = false;
    const boundingClientRect = event.target.getBoundingClientRect();
    let clientX = event.touches[0].clientX;
    let clientY = event.touches[0].clientY;
    let top = boundingClientRect.top;
    let left = boundingClientRect.left;
    this.currentTargetPoint = {
      x: clientX - left,
      y: clientY - top
    };
  }

  useEnd(event) {
    let random = event.target.getAttribute('Lid');
    let json = {};
    let origin = event.target.getAttribute('transform').split(' ');
    let pointObj = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(origin[0]);
    let scale = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(origin[1]);
    let point = pointObj[2].split(',');
    json.mode = event.target.getAttribute('xlink:href').substring(1);
    json.x = point[0];
    json.y = point[1];
    json.scale = scale[2];
    let _point = {
      x: json.x,
      y: json.y,
      mode: json.mode,
      scale: json.scale,
      Lid: random,
      page: event.target.farthestViewportElement.parent._page.index
    };
    if (!this.moveFlag && event.target.nodeName === 'use') {
      $(event.target).remove();
      this.emit('labelAction', Object.assign(_point, { type: 'deleteLabel' }));
    } else {
      this.emit('labelAction', Object.assign(_point, { type: 'moveLabel' }));
    }
    // // 服务器交互 存储
    // this.emit('saveLabel', this._point);
    // 同步学生端
    this.reset();
  }

  useMove(event) {
    if (event.target.nodeName !== 'use') {
      return;
    }
    this.moveFlag = true;
    let mode = event.target.getAttribute('xlink:href').substring(1);
    let random = event.target.getAttribute('Lid');
    const boundingClientRect = event.target.getBoundingClientRect();
    let targetPoint = {
      x: (event.touches[0].clientX) * (595 / this.width) - this.currentTargetPoint.x,
      y: (event.touches[0].clientY) * (842 / this.height) - this.currentTargetPoint.y
    };
    let scale = mode === Label.MODE.BASHANDSIT ? 0.8 : this.scale;
    let target = event.target.setAttribute('transform', `translate(${targetPoint.x},${targetPoint.y}) scale(${scale})`);
    let _point = {
      x: targetPoint.x,
      y: targetPoint.y,
      mode: mode,
      Lid: random,
      page: event.target.farthestViewportElement.parent._page.index,
      scale: scale
    };
    // // 服务器交互 存储
    // this.emit('saveLabel', this._point);
    // 同步学生端
    this.emit('labelAction', Object.assign(_point, { type: 'moveLabel' }));
  }
}
Label.MODE = {
  WRONGPRO: 'wrongPro',
  WRONGRHYTHM: 'wrongRhythm',
  WRONGFINGER: 'wrongFinger',
  INCOHERENCE: 'incoherence',
  BASHANDSIT: 'basHandSit',
};
