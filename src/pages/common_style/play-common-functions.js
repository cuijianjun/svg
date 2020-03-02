import echarts from 'echarts/lib/echarts';
import $ from 'jquery';
import 'echarts/lib/chart/radar';

export default {
  renderChart(element, data, fontColor = '#333', isBackWhite = true) {
    let isPhone = window.innerWidth <= 812;
    let nameStyle = {
      nameFontSize: isPhone ? 9 : 12,
      nameGap: isPhone ? 3 : 13,
      symbolSize: isPhone ? 3 : 4,
    };
    let radarStyle = {
      splitLineColor: isBackWhite ? '#fff' : 'transparent',
      splitAreaColor: isBackWhite ? '#f1f1f1' : '#232e44',
      axisLineColor: isBackWhite ? '#fff' : 'rgba(255, 255, 255, 0.3)'
    };
    let option = {
      radar: {
        name: {
          textStyle: {
            color: fontColor,
            fontSize: nameStyle.nameFontSize
          }
        },
        nameGap: nameStyle.nameGap,
        indicator: [
          { name: `完整性${Math.round(data.complete)}`, max: 100 },
          { name: `难度\n${Math.round(data.difficulty)}`, max: 100 },
          { name: `技巧\n${Math.round(data.technique)}`, max: 100 },
          { name: `表现力${Math.round(data.expressive)}`, max: 100 },
          { name: `节奏\n${Math.round(data.rhythm_speed)}`, max: 100 },
          { name: `音准\n${Math.round(data.pitch)}`, max: 100 }
        ],
        splitArea: {
          areaStyle: {
            color: [radarStyle.splitAreaColor]
          }
        },
        axisLine: {
          lineStyle: {
            color: radarStyle.axisLineColor
          }
        },
        splitLine: {
          lineStyle: {
            color: radarStyle.splitLineColor
          }
        }
      },
      series: [{
        name: '最终得分',
        type: 'radar',
        symbol: 'circle',
        symbolSize: nameStyle.symbolSize,
        // areaStyle: {normal: {}},
        lineStyle: {
          normal: {
            color: '#ff487d'
          }
        },
        areaStyle: {
          normal: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#fff' // 0% 处的颜色
              }, {
                offset: 1, color: '#fa87aa' // 100% 处的颜色
              }],
              globalCoord: false // 缺省为 false
            }
          }
        },
        data: [
          {
            value: [Math.round(data.complete),
              Math.round(data.difficulty),
              Math.round(data.technique),
              Math.round(data.expressive),
              Math.round(data.rhythm_speed),
              Math.round(data.pitch)],
            name: '最终得分'
          }
        ]
      }]
    };
    echarts.init(element).setOption(option);
  },

  showScoreErrorNote(note, $ele = $('.alert-error-note'), innerWidthRate = 0.13) {
    function clearErrorStatus() {
      // every time must clear time out
      clearTimeout(window.errorNoteTimeout);
      $ele.removeClass('show');
      $ele.removeClass('alert-accuracy');
      $ele.children('div').removeClass('show');
      $ele.find('.iconfont').removeClass('show');
    }
    // when open a new note close old
    clearErrorStatus();
    if (note.pitch === 'right' && note.rhythm === 'accurate' && note.velocity === 'accurate') {
      // if all right will not show alert
      return true;
    } else {
      // show errors base on note
      if (note.pitch === 'wrong' || note.pitch === 'miss') {
        $('#accuracy').addClass('show');
        $('#accuracy .icon-cuowu-copy').addClass('show');
        $ele.addClass('alert-accuracy');
      } else {
        if (note.rhythm !== 'accurate') {
          $('#rhythm').addClass('show');
          if (note.rhythm === 'early') {
            $('#rhythm .icon-kuaijin').addClass('show');
            $('#rhythm span').html('节奏快');
          } else {
            $('#rhythm .icon-kuaitui').addClass('show');
            $('#rhythm span').html('节奏慢');
          }
        }
        if (note.velocity !== 'accurate') {
          $('#velocity').addClass('show');
          if (note.velocity === 'light') {
            $('#velocity .icon-up').addClass('show');
            $('#velocity span').html('力度强');
          } else {
            $('#velocity .icon-down').addClass('show');
            $('#velocity span').html('力度弱');
          }
        }
      }
      // show note container
      $ele.addClass('show');
      // set position after alert showed (otherwise DomElement can not find clientwidth)
      $ele.css({
        'left': (note.mousePosition.x + (window.innerWidth * innerWidthRate) - $ele[0].clientWidth / 2) + 'px',
        'top': (note.mousePosition.y - $ele[0].clientHeight - 14) + 'px'
      });
      // close after 3s
      window.errorNoteTimeout = setTimeout(clearErrorStatus, 3000);
    }
  }
};

