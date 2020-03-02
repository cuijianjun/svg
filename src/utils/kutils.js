import $ from 'jquery';

const types = {
  line: true
};

let mainLoadingHtml = (styles) => {
  return `<div class="k-loading">
              <div class="loading-content">
                  ${styles}
              </div>
          </div>`;
};

let lineHtml = (word, buttonMsg) => {
  let html = `<div class="line">
                    <div class="line1"></div>
                    <div class="line2"></div>
                    <div class="line3"></div>
                    <div class="line4"></div>
                    <div class="line5"></div>
                </div>
                <div class="loading-word">
                    ${word}
                </div>
                <div class="loading-btn">
                    ${buttonMsg}
                </div>`;
  return mainLoadingHtml(html);
};

let alert = (content, title) => {
  return `<div class="k-alert">
      <div class="alert-container">
        <div class="title">
          ${title}
        </div>
        <div class="content">
          ${content}
        </div>
        <button class="btn confirm">确定</button>
      </div>
    </div>`;
};

let utils = {
  showLoading: (word = '', buttonMsg = '返回首页', callback = function () {
  }, type = 'line') => {
    let html = '';

    if (!types[type]) type = 'line';

    if (type === 'line') {
      html = lineHtml(word, buttonMsg);
    }

    $('body').append(html);
    $('body').on('click', '.k-loading .loading-btn', function (e) {
      callback();
      $('.k-loading').remove();
    });

    setTimeout(function () {
      $('.k-loading .loading-btn').fadeIn(400);
    }, 8000);
  },
  hideLoading: () => {
    setTimeout(() => {
      $('.k-loading').remove();
    }, 700);
  },
  alert: (content = '', callback = function () {
  }, title = '提示') => {
    let promise = new Promise((resolve, reject) => {
      $('body').append(alert(content, title));
      $('.k-alert').fadeIn(300);
      $('body').on('click', '.k-alert .confirm', function (e) {
        callback();
        utils.hideAlert($(this).parents('.k-alert'));
      });
      if ($('.k-alert')) {
        resolve();
      } else {
        reject(new Error());
      }
    });
    return promise;
  },
  hideAlert: ($elm) => {
    $elm.fadeOut(300, function () {
      this.remove();
    });
  },
  toast: (msg, duration = '3000') => {
    let m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = 'width:60%; min-width:1.5rem; background:#000; opacity:0.5; color:#fff; line-height:0.4rem;' +
      ' text-align:center; border-radius:0.05rem; position:fixed; top:40%; left:20%;' +
      'z-index:999999; font-weight:bold;font-size:0.12rem;padding:0.2rem';
    document.body.appendChild(m);
    setTimeout(function () {
      let d = 0.5;
      m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
      m.style.opacity = '0';
      setTimeout(function () {
        document.body.removeChild(m);
      }, d * 1000);
    }, duration);
  },
  showPage: (options) => { // UI
    $(`.${options['svgDom']}`).show();
    for (let key in options) {
      if (options[key] !== '') {
        if (key !== 'svgDom') {
          $(`#${options[key]}`).show();
        }
      }
    }
  },
  popover: (msg, dom, direction = 'top', isShow = 'show') => {
    if (!isShow) {
      let dom = document.getElementsByClassName('popOver');
      document.body.removeChild(dom);
      return;
    }
    let pop = `<div class="popOver ${direction}">${msg}</div>`;
    let objE = document.createElement('div');
    objE.innerHTML = pop;
    let node = objE.childNodes;
    let width = dom.offsetWidth;
    let height = dom.offsetHeight;
    let offsetLeft = $(dom).offset().left;
    let offsetTop = $(dom).offset().top;
    let innerWidth = $(node).width();
    console.log(width, height, offsetLeft, offsetTop, innerWidth);
    if (direction === 'top') {
      $(node).css({
        'top': offsetTop + height,
        'left': offsetLeft + width / 2
      });
    } else if (direction === 'left') {
      $(node).css({
        'top': offsetTop + height / 2,
        'left': offsetLeft + width
      });
    } else if (direction === 'right') {
      $(node).css({
        'top': offsetTop + height,
        'left': offsetLeft
      });
    }
    $('body').append(node);
  }
};

export default utils;
