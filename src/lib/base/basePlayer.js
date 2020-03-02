import EventEmitter from 'event-emitter-es6';
import { parseUrlParams, utils, Raven, toFixed } from '@theone/webscore';
import $ from 'jquery';

export default class BasePlayer extends EventEmitter {
  constructor () {
    super();
    let urlParams = parseUrlParams();
    this.user_token = urlParams.magister_user_token;
    this.app_platform = urlParams.app_platform;
    this.app_version = urlParams.app_version;
    this.scoreId = urlParams.score_id;
    this.recordId = urlParams.recordId;
    this.task_id = urlParams.task_id;
    this.lesson_id = urlParams.lesson_id;
    this.user_role = urlParams.user_role;
    this.play_mode = urlParams.play_mode;
    this.service_id = urlParams.service_id; // 标明是哪个serviceId
    this.rank = Number(urlParams.rank);
    this.user_version = Number(urlParams.user_version);
    this.recordPlay = 0;
    // this.lesson_msg = JSON.parse(localStorage.getItem('lesson_msg') ? localStorage.getItem('lesson_msg') : '{}');
    localStorage.setItem('userToken', this.user_token);
    localStorage.setItem('appPlatform', this.app_platform);
    localStorage.setItem('appVersion', this.app_version);
  }

  registerEvents() {
    $('#layout').off('click').on('click', (event) => {
      event.stopPropagation();
      if ($('.header').css('display') === 'none') {
        $('.header').css('display', 'block');
        $('.header').animate({ 'top': '0' }, 100);
      }
    });
  }

  buttonEvents () {
  };

  showTitle () {
    if ($('.play .header').css('display') === 'none') {
      $('.play .header').fadeIn({ 'top': '0' }, 150);
      $('.play .play-main').animate({ 'top': '1rem' });
    }
  }

  hideTitle () {
    $('.play .header').fadeOut(() => {
      // $('.play .header').css('display', 'none');
      $('.play .play-main').animate({ 'top': '0' });
    });
  }

  startPlay () {
    this.recordPlay = 1;
    $('#button-record-play').hide();
    $('#button-record-stop').show();
  }

  stopPlay () {
    $('#button-record-stop').hide();
    $('#button-record-play').show();
    this.recordPlay = 0;
  }

  _onStartPlayRecord () {
    this.changeButtonStatus(true);
    this.setCursorPosition(0);
  }

  _onStopPlayRecord () {
    this.changeButtonStatus(false);
    this.setCursorPosition(0);
  }

  changeButtonStatus (flag) { // todo
    if (flag) {
      $('#button-playback-stop').show();
      $('#button-playback-play').hide();
    } else {
      $('#button-playback-stop').hide();
      $('#button-playback-play').show();
    }
  }

  setCursorPosition (position) {
    // TODO
  };

  _onStopPlaySample () {
    $('#button-stop').hide();
    $('#button-play').show();
    this.setCursorPosition(0);
    $('html,body').animate({ scrollTop: 0 }, 100);
  };

  renderChart (values) {
    if (!this._isArray(values)) {
      utils.toast('请传入数组，且长度为5');
      return false;
    }
    if (values.length !== 5) {
      utils.toast('数组长度不等于5');
      return false;
    }
    require.ensure([], function () {
      const a = require('../charts');
      let dom = document.getElementById('pop-result');
      let myChart = echarts.init(dom) // eslint-disable-line
      let app = {};
      let option = null;
      option = {
        legend: {
          x: 'center',
        },
        radar: [
          {
            name: {
              textStyle: {
                color: '#999',
                fontSize: adapteFont()
              }
            },
            indicator: [
              { text: '音准', max: 100 },
              { text: '速度', max: 100 },
              { text: '平稳性', max: 100 },
              { text: '完整性', max: 100 },
              { text: '节奏', max: 100 }
            ],
            splitArea: {
              show: true,
              areaStyle: {
                color: '#fff'
                // 图表背景网格的颜色
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: '#b474ff'
                // 图表背景网格线的颜色
              }
            },
            center: ['50%', '50%'],
            radius: adapte(),
            splitNumber: 4,
          }
        ],
        series: [
          {
            type: 'radar',
            symbol: 'none',
            smooth: true,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#b474ff', // 图表中各个图区域的边框线颜色
                  opacity: 0
                },
                areaStyle: {
                  type: 'default',
                  color: '#b474ff'
                }
              }
            },
            data: [
              {
                value: values,
              }
            ]
          }
        ]
      };
      function adapte() {
        if ((document.documentElement.offsetWidth / 10.24) >= 100) {
          return 100;
        } else {
          return 42;
        }
      }
      function adapteFont() {
        if ((document.documentElement.offsetWidth / 10.24) >= 100) {
          return 18;
        } else {
          return 12;
        }
      }
      // console.log(document.documentElement.style.fontSize.split());
      if (option && typeof option === 'object') {
        myChart.setOption(option, true);
        // window.onresize = myChart.resize;
      }
    });
  }

  _isArray (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  }

  checkAngle (musvg) {
    for (let i = 0; i < musvg._score.pages.length; i++) {
      $(musvg._score.pages[i]._svgElement).on('touchstart', (ev) => {
        this.startX = ev.touches[0].pageX;
        this.startY = ev.touches[0].pageY;
        this.scrollTopStart = $('#xm-main-container').offset().top;
      });
    }

    for (let i = 0; i < musvg._score.pages.length; i++) {
      $(musvg._score.pages[i]._svgElement).on('touchend', (ev) => {
        let endX, endY, endTop;
        endTop = $('#xm-main-container').offset().top - this.scrollTopStart;
        endX = ev.changedTouches[0].pageX;
        endY = ev.changedTouches[0].pageY + endTop;
        let direction = this._getSlideDirection(this.startX, this.startY, endX, endY);
        switch (direction) {
          case 0:
            this._updateTitle('direction', '0');
            break;
          case 1:
            this._updateTitle('direction', 'top');
            break;
          case 2:
            this._updateTitle('direction', 'bottom');
            break;
          case 3:
            this._updateTitle('direction', 'left');
            break;
          case 4:
            this._updateTitle('direction', 'right');
            break;
          default:
        }
      });
    }
  }

  // 返回角度
  _getSlideAngle (dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  // 根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
  _getSlideDirection (startX, startY, endX, endY) {
    let dy = startY - endY;
    let dx = endX - startX;
    let result = 0;
    console.log(dx, dy);
    // 如果滑动距离太短
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      return result;
    }
    let angle = this._getSlideAngle(dx, dy);
    console.log(angle, 'angle');
    if (angle >= -45 && angle < 30) {
      result = 4;
    } else if (angle >= 30 && angle < 150) {
      result = 1;
    } else if (angle >= -135 && angle < -45) {
      result = 2;
    } else if ((angle >= 150 && angle <= 180) || (angle >= -180 && angle < -150)) {
      result = 3;
    }

    return result;
  }

  _updateTitle(type, msg) {
    if (msg === 'top') {
      this.hideTitle();
    } else {
      this.showTitle();
    }
  }
}
