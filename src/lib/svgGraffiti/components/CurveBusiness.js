import $ from 'jquery';
import { calBezierCtrlPoint, generateMixed, nodeToString, sliceNum } from 'lib/utils/tools';
import EventEmitter from 'event-emitter-es6';
import preferences from '../preferences.json';
import Path from './Path';

export default class CurveBusiness extends EventEmitter {

  constructor(sketchpad) {
    super();
    this.reset();
    this.preferences = preferences;
    this.setBusinessMode('curve');
    this._registerEvents();
  }

  reset() {
    this.lastPoint = null;
    this.startPoint = null;
    this.movePoint = null;
    this.points = [];
    this.shape = null;
    this.pathChunk = '';
    this.page = null;
    this.target = null;

    this.begingDraw = false;
  }

  _registerEvents() {
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

  setBusinessMode(mode) {
    this.businessMode = mode;
  }

  onmousedown(event) {
    this.begingDraw = true;
    this.startPoint = this.lastPoint = this.getPosition(event);

    if (this.businessMode === CurveBusiness.MODE.ERASER) {
      event.stopPropagation();
      let e = event.target;
      let next = e.nextSibling;
      if (e.nodeName === 'svg') {
        return;
      }
      if (e.correspondingUserElement) {
        e = e.correspondingUserElement;
      }
      let shadowId = e.getAttribute('shadow');
      let ele = $(e.parentNode).find(`path[shadow=${shadowId}]`);
      ele.remove();
      this.emit('graffitiAction', {
        type: 'eraser',
        shadowId: shadowId, // 目标path,
        page: event.currentTarget.parent._page.index
      });
    }
  }

  onmousemove(event) {
    // 需要阻止默认行为，否则会导致fireEvent('mouseup')的时候导致onmousedown不执行
    // event.preventDefault();
    this.sketchpad = event.target;
    this.ram = generateMixed(12);
    if (['path', 'use'].includes(this.sketchpad.nodeName)) {
      return;
    }
    this.target = event.target.getElementById('graffiti');
    if (this.begingDraw) {
      // 删除上一次移动的旧笔迹数据
      this.shape && this.shape.remove();
      this.movePoint = this.getPosition(event);
      // 计算控制点
      const ctrlPoint = {
        x: (this.lastPoint.x + this.movePoint.x) / 2,
        y: (this.lastPoint.y + this.movePoint.y) / 2
      };
      // 记录控制点
      this.points.push({
        ...ctrlPoint
      });
      // 收集笔迹数据块
      this.pathChunk = `M${this.points[0].x}
        ${this.points[0].y}`;
      for (let i = 1; i < this.points.length; i++) {
        const ctrlP = calBezierCtrlPoint(this.points, i - 1);
        // 记录笔迹数据
        this.pathChunk += `Q${ctrlP.pB.x} ${ctrlP.pB.y} ${this.points[i].x} ${this.points[i].y}`;
      }

      if (this.businessMode === CurveBusiness.MODE.CURVE) {
        // 绘制笔迹
        this.shape = new Path({
          'd': this.pathChunk
        })
          .stroke(this.preferences['strokeColor'])
          .strokeWidth(this.preferences['strokeWidth'])
          .strokeLinecap(Path.LINECAP.ROUND)
          .strokeOpacity(0.2)
          .fill('none')
          .affix(this.target);
        // 触发native方法
        this.emit('graffitiAction', {
          type: 'draw',
          points: this.points,
          shape: this.ram,
          page: event.target.parent._page.index
        });
      }
      this.lastPoint = this.movePoint;
    }
  }

  onmouseup(event) {
    if (this.begingDraw && this.movePoint) {
      // 删除旧的轨迹数据
      this.shape && this.shape.remove();

      if (this.businessMode === CurveBusiness.MODE.CURVE) {
        // 绘制整段背景轨迹
        this.shadow = new Path({
          'd': this.pathChunk
        })
          .stroke(this.preferences['strokeColor'])
          .strokeWidth(this.preferences['strokeWidth'] + 10)
          .strokeLinecap(Path.LINECAP.ROUND)
          .strokeOpacity(0)
          .fill('none')
          .attr({ 'shadow': this.ram })
          .affix(this.target);
        // 绘制整段曲线轨迹
        this.shape = new Path({
          'd': this.pathChunk
        })
          .stroke(this.preferences['strokeColor'])
          .strokeWidth(this.preferences['strokeWidth'])
          .strokeOpacity(this.preferences['strokeOpacity'])
          .strokeLinecap(Path.LINECAP.ROUND)
          .attr({ 'shadow': this.ram })
          .fill('none')
          .affix(this.target);
        // 触发保存服务器的方法
        this.emit('graffitiAction', {
          type: 'save',
          dom: nodeToString(this.shadow.stamper) + nodeToString(this.shape.stamper), // 整个dom结构
          page: event.target.parent._page.index,
        });
      }
    }

    this.reset();
  }
}

CurveBusiness.MODE = {
  CURVE: 'curve',
  ERASER: 'eraser'
};
