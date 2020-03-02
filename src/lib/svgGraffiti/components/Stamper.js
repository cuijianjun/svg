export default class Stamper {
  constructor(tag = '', attrs = {}) {
    this.tag = tag;
    this.attrs = {
      ...attrs
    };
    this.stamper = null;
    this.NS = 'http://www.w3.org/2000/svg';
    this.ATTR_NS = 'http://www.w3.org/1999/xlink';
  }

  createSvg(tag, attrs) {
    if (!document.createElementNS) {
      return {
        msg: 'your client does not support svg.'
      };
    }
    let svgObj = null;
    if (tag === 'object') {
      svgObj = document.createElement('object');
    } else {
      svgObj = document.createElementNS(this.NS, tag);
    }
    for (let key in attrs) {
      switch (key) {
        case 'xlink:href':
          // 文本路径添加属性特有
          svgObj.setAttributeNS(this.ATTR_NS, key, attrs[key]);
          break;
        default:
          svgObj.setAttribute(key, attrs[key]);
      }
    }
    return svgObj;
  }

  fill(color = '#000') {
    this.attrs['fill'] = color;
    return this;
  }

  fillOpacity(opacity = 1) {
    this.attrs['fill-opacity'] = opacity;
    return this;
  }

  stroke(color = '#000') {
    this.attrs['stroke'] = color;
    return this;
  }

  attr(arg = {}) {
    if (typeof arg === 'string') {
      return this.attrs[arg];
    }
    for (let value in arg) {
      this.attrs[value] = arg[value];
    }
    return this;
  }
  strokeWidth(width = 0) {
    this.attrs['stroke-width'] = width;
    return this;
  }

  strokeOpacity(opacity = 1) {
    this.attrs['stroke-opacity'] = opacity;
    return this;
  }

  strokeDash() {
    this.attrs['stroke-dasharray'] = Array.from(arguments).join(',');
    return this;
  }

  /**
     * 设置linecap
     * @param linecap 'butt' || 'round' || 'square'
     */
  strokeLinecap(linecap = this.LINECAP.BUTT) {
    this.attrs['stroke-linecap'] = linecap;
    return this;
  }

  // 创建svg节点对象(雕刻)
  engrave() {
    this.stamper = this.createSvg(this.tag, this.attrs);
    return this;
  }

  // 获取创建的svg节点
  getStamper() {
    return this.stamper;
  }

  // 将创建出来的svg节点追加到给定的svg舞台(盖章)
  affix(paper) {
    this.engrave();
    paper.appendChild(this.stamper);
    return this;
  }

  remove() {
    this.stamper.remove();
  }
}

Stamper.LINECAP = {
  'BUTT': 'butt',
  'ROUND': 'round',
  'SQUARE': 'square'
};
