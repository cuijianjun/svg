/* eslint no-proto: 0 */
/* eslint no-extend-native: 0 */

// Polyfiling Uint8Array.from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from
if (!Uint8Array.__proto__.from) {
  (function () {
    Uint8Array.__proto__.from = function (obj, func, thisObj) {

      let typedArrayClass = Uint8Array.__proto__;
      // if(typeof this !== 'function') {
      //   throw new TypeError('# is not a constructor');
      // }
      if (this.__proto__ !== typedArrayClass) {
        throw new TypeError('this is not a typed array.');
      }

      func = func || function (elem) {
        return elem;
      };

      if (typeof func !== 'function') {
        throw new TypeError('specified argument is not a function');
      }

      obj = Object(obj);
      if (!obj['length']) {
        return new this(0);
      }
      let copy_data = [];
      for (let i = 0; i < obj.length; i++) {
        copy_data.push(obj[i]);
      }

      copy_data = copy_data.map(func, thisObj);

      let typed_array = new this(copy_data.length);
      for (let i = 0; i < typed_array.length; i++) {
        typed_array[i] = copy_data[i];
      }
      return typed_array;
    };
  })();
}

// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice
if (!Uint8Array.prototype.slice) {
  Object.defineProperty(Uint8Array.prototype, 'slice', {
    value: Array.prototype.slice
  });
}

function urlLoader(url, responseType) {
  responseType = responseType || 'text';
  return new Promise(
    function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = responseType;
      xhr.onload = function (e) {
        let result = this.response;
        resolve(result);
      };
      xhr.send();
    }
  );
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}

function eqSet(as, bs) {
  if (as.size !== bs.size) return false;
  for (let a of as) if (!bs.has(a)) return false;
  return true;
}

function base64ToArrayBuffer(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}

function highLightText(text) {
  text = text.replace(/【/g, '<span class="empha1">');
  text = text.replace(/「/g, '<span class="empha2">');
  text = text.replace(/{/g, '<span class="empha3">');
  text = text.replace(/\[/g, '<span class="empha4">');
  text = text.replace(/】/g, '</span>');
  text = text.replace(/」/g, '</span>');
  text = text.replace(/}/g, '</span>');
  text = text.replace(/\]/g, '</span>');
  return text;
}

function highLightTextPixi(text) {
  text = text.replace(/【/g, '<empha1>');
  text = text.replace(/「/g, '<empha2>');
  text = text.replace(/{/g, '<empha3>');
  text = text.replace(/\[/g, '<empha4>');
  text = text.replace(/】/g, '</empha1>');
  text = text.replace(/」/g, '</empha2>');
  text = text.replace(/}/g, '</empha3>');
  text = text.replace(/\]/g, '</empha4>');
  return text;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function parseUrlParams() {
  let searches = window.location.search.replace('?', '').split('&');
  let params = {};
  if (searches.length > 0) {
    for (let i = 0; i < searches.length; i++) {
      let index = searches[i].indexOf('=');
      let key = searches[i].substring(0, index);
      let value = searches[i].substring(index + 1, searches[i].length);
      params[key] = value;
    }
  }
  return params;
}

function generateMixed(n) {
  let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
    'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let res = '';
  for (let i = 0; i < n; i++) {
    let id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }
  return res;
}

function toFixed(num, digit = 0) {
  if (parseFloat(num).toString() === 'NaN') {
    return false;
  };
  if (parseFloat(num).toString() === '0') {
    return 0;
  };
  return Math.round(parseFloat(num) * Math.pow(10, digit)) / Math.pow(10, digit);
}

function sliceNum(num) {
  let tmp = num.toString();
  return Number(tmp.substr(0, tmp.indexOf('.') + 2));
}

function nodeToString(node) {
  let tmpNode = document.createElement('div');
  tmpNode.appendChild(node.cloneNode(true));
  let str = tmpNode.innerHTML;
  tmpNode = node = null;
  return str;
}

function calBezierCtrlPoint(ps, i, a, b) {
  if (!a || !b) {
    a = 0.25;
    b = 0.25;
  }
  let pAx;
  let pAy;
  let pBx;
  let pBy;
  // 处理两种极端情形
  if (i < 1) {
    pAx = ps[0].x + (ps[1].x - ps[0].x) * a;
    pAy = ps[0].y + (ps[1].y - ps[0].y) * a;
  } else {
    pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a;
    pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a;
  }
  if (i > ps.length - 3) {
    let last = ps.length - 1;
    pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b;
    pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b;
  } else {
    pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b;
    pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b;
  }
  return {
    pA: {
      x: pAx,
      y: pAy
    },
    pB: {
      x: pBx,
      y: pBy
    }
  };
}

function stringToNode(string) {
  let objE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  objE.innerHTML = string;
  return objE.childNodes;
}

function once(f) {
  let run;
  return function () {
    if (!run) {
      run = true;
      f.apply(this, arguments);
    }
  };
}

function dateFtt(fmt, date) {
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  };
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    };
  };
  return fmt;
}

function createSvg(tag, attrs) {
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

export {
  urlLoader, shuffle, eqSet, base64ToArrayBuffer, highLightText,
  highLightTextPixi, arraysEqual, parseUrlParams, generateMixed, toFixed,
  sliceNum, stringToNode, nodeToString, calBezierCtrlPoint, dateFtt, createSvg
};
