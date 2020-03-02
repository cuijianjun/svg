import Sketchpad from './components/bindEvent';
import temp from 'lib/svgGraffiti/temp.svg';
import Stamper from 'lib/svgGraffiti/components/Stamper';
import EventEmitter from 'event-emitter-es6';
import $ from 'jquery';
import { stringToNode } from 'lib/utils/tools';
import Use from 'lib/svgGraffiti/components/Use';

export default class SVGraffiti extends EventEmitter {

  constructor (config) {
    super();
    this._opts = config || {};
    this.stamper = new Stamper();
    this.svgObjects = null;
    this.graffitiElements = [];
    if (this._opts.graffitiEnabled) {
      this._registerEvents();
    }
  }

  _registerEvents () {
    this._opts.targetEvent.on('scoreOnLoad', (obj) => {
      this._init(obj);
    });
  }

  _registerInEvents() {
    this.sketchpad.on('graffitiAction', obj => {
      this.emit('graffitiAction', obj);
    });

    this.sketchpad.on('labelAction', obj => {
      this.emit('labelAction', obj);
    });

    this.sketchpad.on('modeChange', obj => {
      this.emit('modeChange', obj);
    });
  }

  async _init (obj) {
    await this._createTempSvg();
    this.sketchpad = new Sketchpad(this.graffitiElements, obj);
    await this._initContent(obj);
    this._registerInEvents();
  }

  async _initContent(obj) {
    try {
      await this.loadGraffiti(obj);
    } catch (e) {
      console.log(e);
    }

    try {
      await this.getLabel(obj);
    } catch (e) {
      console.log(e);
    }
  }

  getSvgObjects () {
    this.svgObjects = document.getElementsByTagName('object');
  }

  async _createTempSvg () {
    this.getSvgObjects();
    let length = this.svgObjects.length;
    let array = [];
    let targetDiv = document.getElementsByClassName(this._opts.pageClassName);
    for (let i = 0; i < length; i++) {
      let graffitiObject = this.stamper.createSvg('object', {
        type: 'image/svg+xml',
        data: temp,
        style: 'width: 85%; position: absolute; left: 0px;',
      });
      targetDiv[i].appendChild(graffitiObject);
      this._bindPage(graffitiObject, i);
      let fixGraffiti = new Promise((resolve, reject) => {
        graffitiObject.onload = () => {
          this.graffitiElements.push(graffitiObject.contentDocument.rootElement);
          graffitiObject.contentDocument.querySelector('svg').parent = graffitiObject;
          resolve();
        };
      });
      await Promise.all([fixGraffiti]);
    }
  }

  _bindPage (graffitiObject, index) {
    let pages = this._opts.targetEvent._score.pages;
    pages[index]._graffitiObject = graffitiObject;
    graffitiObject._page = pages[index];
  }

  enableGraffiti(bool) {
    for (let graffitiObject of this.graffitiElements) {
      this._controlGraffiti(graffitiObject, bool);
    }
  }

  _controlGraffiti (graffitiObject, bool) {
    if (!bool) {
      // graffitiObject.style.visibility = 'hidden';
      graffitiObject.parent.style.pointerEvents = 'none';
    } else {
      graffitiObject.parent.style.visibility = 'inherit';
      graffitiObject.parent.style.pointerEvents = 'auto';
    }
  }

  publish(entity, mode) {
    this.sketchpad.notify(entity, mode);
  }

  clearGraffiti() {
    let page = this.musvg._score.pages;
    for (let i = 0; i < page.length; i++) {
      page[i]._graffitiObject.contentDocument.rootElement.innerHTML = '';
    }
  }

  async loadGraffiti(scoreId) {
    try {
      this._graffitiData = await this.sketchpad._userService.getGraffiti(scoreId);
    } catch (err) {
      this.emit('loadGraffiti', {
        flag: 0,
        msg: err
      });
    }
    let content = this._graffitiData.scrawl_dict && this._graffitiData.scrawl_dict.contents;
    if (content && Array.isArray(content) && content.length !== 0) {
      for (let i = 0; i < this.graffitiElements.length; i++) {
        $(this.graffitiElements[i].getElementById('graffiti')).append($(stringToNode(content[i])));
      }
    }
    this.enableGraffiti(0);
    this.emit('loadGraffiti', {
      flag: 1
    });
  }

  async getLabel(obj) {
    let data = await this.sketchpad._userService.getLabel(obj);
    if (data && data.meta.code !== 0) {
      console.log(data.meta.msg);
      return;
    }
    let _label = data.data.tag_dict.length > 0 && data.data.tag_dict;
    let sketchpad = this.sketchpad;
    for (let value of _label) {
      if (JSON.stringify(value) === '{}') {
        return false;
      }
      let { x, y, mode, Lid, page, scale } = value;
      this.use = new Use({
        'xlink:href': '#' + mode,
        transform: `translate(${x},${y}) scale(${scale})`,
        Lid: Lid
      }).affix(sketchpad[page].getElementById('labelContainer'));
    }
    console.log('getLabelSuccessful');
  }
}
