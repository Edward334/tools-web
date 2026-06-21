var { createApp, ref, watch, computed } = Vue;

var COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#2c3e50',
  '#f1c40f', '#1e88e5', '#8e44ad', '#00bcd4',
  '#ff7043', '#7cb342', '#c2185b', '#546e7a'
];

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function getColor(alpha) {
  return isDark() ? 'rgba(238,238,238,' + alpha + ')' : 'rgba(17,17,17,' + alpha + ')';
}

function getGridColor() {
  return isDark() ? 'rgba(238,238,238,0.12)' : 'rgba(17,17,17,0.08)';
}

createApp({
  setup: function () {
    var dark = ref(isDark());

    function applyTheme(val) {
      document.documentElement.classList.toggle('dark', val);
    }
    applyTheme(dark.value);
    watch(dark, applyTheme);

    var chartType = ref('bar');
    var labels = ref('一月,二月,三月,四月,五月');
    var series = ref([
      { name: '系列1', values: '120,200,150,80,230' }
    ]);
    var chartTitle = ref('');
    var whiteBg = ref(false);
    var toast = ref('');

    var parsedLabels = computed(function () {
      return labels.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    });

    var parsedSeries = computed(function () {
      var isPie = chartType.value === 'pie';
      return series.value.map(function (s) {
        var obj = {
          name: s.name,
          values: s.values.split(',').map(function (v) {
            var n = parseFloat(v.trim());
            return isNaN(n) ? 0 : n;
          }).filter(function (v) { return !isNaN(v); })
        };
        if (isPie) {
          obj.labels = (s.labels || '').split(',').map(function (l) { return l.trim(); }).filter(Boolean);
          obj.px = s.px !== undefined ? s.px : 50;
          obj.py = s.py !== undefined ? s.py : 50;
          obj.r = s.r || 0;
        }
        return obj;
      });
    });

    var dataValid = computed(function () {
      var ps = parsedSeries.value;
      if (ps.length === 0) return false;
      if (chartType.value === 'pie') {
        for (var i = 0; i < ps.length; i++) {
          if (ps[i].values.length === 0) return false;
        }
        return true;
      }
      var pl = parsedLabels.value;
      if (pl.length === 0) return false;
      for (var j = 0; j < ps.length; j++) {
        if (ps[j].values.length !== pl.length) return false;
      }
      return true;
    });

    /* ── Drag state ── */

    var dragIdx = -1;
    var dragOffX = 0, dragOffY = 0;
    var listenersOn = false;

    function getCanvasXY(e) {
      var c = document.getElementById('chartCanvas');
      if (!c) return { x: 0, y: 0 };
      var rect = c.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function hitTestPie(data, w, h, mx, my) {
      for (var i = data.length - 1; i >= 0; i--) {
        var cx = w * data[i].px / 100;
        var cy = h * data[i].py / 100;
        var r = data[i].r;
        var dx = mx - cx, dy = my - cy;
        if (dx * dx + dy * dy <= r * r) return i;
      }
      return -1;
    }

    function onMouseDown(e) {
      if (chartType.value !== 'pie') return;
      var c = document.getElementById('chartCanvas');
      if (!c) return;
      var pos = getCanvasXY(e);
      var data = parsedSeries.value;
      var w = parseFloat(c.style.width);
      var h = parseFloat(c.style.height);
      var idx = hitTestPie(data, w, h, pos.x, pos.y);
      if (idx < 0) return;
      dragIdx = idx;
      var cx = w * data[idx].px / 100;
      var cy = h * data[idx].py / 100;
      dragOffX = pos.x - cx;
      dragOffY = pos.y - cy;
      c.style.cursor = 'grabbing';
    }

    function onMouseMove(e) {
      if (dragIdx < 0) return;
      var c = document.getElementById('chartCanvas');
      if (!c) return;
      var pos = getCanvasXY(e);
      var w = parseFloat(c.style.width);
      var h = parseFloat(c.style.height);
      var s = series.value[dragIdx];
      s.px = Math.round((pos.x - dragOffX) / w * 100);
      s.py = Math.round((pos.y - dragOffY) / h * 100);
      s.px = Math.max(2, Math.min(98, s.px));
      s.py = Math.max(2, Math.min(98, s.py));
      redraw();
    }

    function onMouseUp() {
      if (dragIdx < 0) return;
      dragIdx = -1;
      var c = document.getElementById('chartCanvas');
      if (c) c.style.cursor = 'grab';
    }

    function attachListeners() {
      if (listenersOn) return;
      var c = document.getElementById('chartCanvas');
      if (!c) return;
      c.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      listenersOn = true;
    }

    /* ── Drawing ── */

    function setupCanvas() {
      var c = document.getElementById('chartCanvas');
      if (!c) return null;
      var rect = c.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var w = Math.max(rect.width - 4, 600);
      var h = chartType.value === 'pie' ? 580 : 500;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      c.width = w * dpr;
      c.height = h * dpr;
      var ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);

      c.style.background = whiteBg.value ? '#ffffff' : 'transparent';
      if (whiteBg.value) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
      if (chartType.value === 'pie') {
        attachListeners();
        c.style.cursor = 'grab';
      } else {
        c.style.cursor = 'default';
      }
      return { ctx: ctx, w: w, h: h, c: c };
    }

    function drawAll() {
      var result = setupCanvas();
      if (!result) return;
      var ctx = result.ctx, w = result.w, h = result.h;
      var lbls = parsedLabels.value;
      var data = parsedSeries.value;
      var type = chartType.value;

      if (type === 'pie') {
        drawPieChart(ctx, w, h, data);
      } else if (type === 'line') {
        drawLineChart(ctx, w, h, lbls, data);
      } else {
        drawBarChart(ctx, w, h, lbls, data);
      }
    }

    function drawChart() {
      if (!dataValid.value) {
        showToast('数据不完整，请检查输入');
        return;
      }
      drawAll();
      showToast('图表已绘制');
    }

    var rafId = 0;

    function redraw() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        drawAll();
      });
    }

    function autoLayoutPies() {
      var arr = series.value;
      var count = arr.length;
      var positions = [];
      if (count === 1) {
        positions.push({ px: 50, py: 50 });
      } else if (count === 2) {
        positions.push({ px: 25, py: 50 });
        positions.push({ px: 75, py: 50 });
      } else {
        for (var i = 0; i < count; i++) {
          positions.push({ px: Math.round((i + 0.5) / count * 100), py: 50 });
        }
      }
      for (var j = 0; j < count; j++) {
        var s = arr[j];
        if (s.px === undefined || s.py === undefined) {
          s.px = positions[j].px;
          s.py = positions[j].py;
        }
      }
    }

    watch(chartType, function (val) {
      if (val === 'pie') autoLayoutPies();
    });

    watch(whiteBg, function () {
      if (dataValid.value) redraw();
    });

    function drawBarChart(ctx, w, h, lbls, data) {
      var pad = { top: 30, right: 20, bottom: 50, left: 50 };
      var legendH = data.length > 1 ? 24 : 0;
      pad.bottom += legendH;
      var cw = w - pad.left - pad.right;
      var ch = h - pad.top - pad.bottom;

      var allVals = [];
      for (var si = 0; si < data.length; si++) {
        for (var vi = 0; vi < data[si].values.length; vi++) {
          allVals.push(data[si].values[vi]);
        }
      }
      var maxVal = Math.max.apply(null, allVals) * 1.15 || 1;

      drawGrid(ctx, pad, cw, ch, maxVal);

      var numLabels = lbls.length;
      var numSeries = data.length;
      var groupW = cw / numLabels;
      var bw = Math.min(groupW * 0.7 / numSeries, 40);
      var gap = (groupW - bw * numSeries) / 2;

      if (chartTitle.value) {
        ctx.fillStyle = getColor(1);
        ctx.font = 'bold 13px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText(chartTitle.value, w / 2, 18);
      }

      for (var li = 0; li < numLabels; li++) {
        var gx = pad.left + groupW * li;
        for (var si2 = 0; si2 < numSeries; si2++) {
          var x = gx + gap + si2 * bw;
          var val = data[si2].values[li];
          var bh = (val / maxVal) * ch;
          var y = pad.top + ch - bh;
          ctx.fillStyle = COLORS[si2 % COLORS.length];
          ctx.fillRect(x, y, bw, bh);
        }
      }

      for (var li2 = 0; li2 < numLabels; li2++) {
        ctx.fillStyle = getColor(0.5);
        ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText(lbls[li2], pad.left + groupW * li2 + groupW / 2, pad.top + ch + 16);
      }
      drawLegend(ctx, pad, w, h, data, legendH);
    }

    function drawLineChart(ctx, w, h, lbls, data) {
      var pad = { top: 30, right: 20, bottom: 50, left: 50 };
      var legendH = data.length > 1 ? 24 : 0;
      pad.bottom += legendH;
      var cw = w - pad.left - pad.right;
      var ch = h - pad.top - pad.bottom;

      var allVals = [];
      for (var si = 0; si < data.length; si++) {
        for (var vi = 0; vi < data[si].values.length; vi++) {
          allVals.push(data[si].values[vi]);
        }
      }
      var maxVal = Math.max.apply(null, allVals) * 1.15 || 1;
      var minVal = Math.min.apply(null, allVals);
      var range = maxVal - minVal || 1;

      drawGrid(ctx, pad, cw, ch, maxVal);

      var numLabels = lbls.length;
      var numSeries = data.length;

      if (chartTitle.value) {
        ctx.fillStyle = getColor(1);
        ctx.font = 'bold 13px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText(chartTitle.value, w / 2, 18);
      }

      for (var si2 = 0; si2 < numSeries; si2++) {
        var step = numLabels > 1 ? cw / (numLabels - 1) : cw / 2;
        var points = [];
        for (var li = 0; li < numLabels; li++) {
          var px = pad.left + (numLabels > 1 ? li * step : cw / 4);
          var py = pad.top + ch - ((data[si2].values[li] - minVal) / range) * ch;
          points.push({ x: px, y: py });
        }
        ctx.beginPath();
        ctx.strokeStyle = COLORS[si2 % COLORS.length];
        ctx.lineWidth = 2;
        ctx.moveTo(points[0].x, points[0].y);
        for (var pi = 1; pi < points.length; pi++) {
          ctx.lineTo(points[pi].x, points[pi].y);
        }
        ctx.stroke();
        for (var li2 = 0; li2 < points.length; li2++) {
          ctx.beginPath();
          ctx.fillStyle = COLORS[si2 % COLORS.length];
          ctx.arc(points[li2].x, points[li2].y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (var li3 = 0; li3 < numLabels; li3++) {
        ctx.fillStyle = getColor(0.5);
        ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText(lbls[li3], pad.left + (numLabels > 1 ? li3 * (cw / (numLabels - 1)) : cw / 4), pad.top + ch + 16);
      }
      drawLegend(ctx, pad, w, h, data, legendH);
    }

    function drawPieChart(ctx, w, h, data) {
      for (var si = 0; si < data.length; si++) {
        var ps = data[si].values;
        var pl = data[si].labels;
        var total = 0;
        for (var i = 0; i < ps.length; i++) total += ps[i];
        if (total === 0) continue;

        var cx = w * data[si].px / 100;
        var cy = h * data[si].py / 100;

        var numLabels = pl.length;
        var legendH = numLabels > 0 ? numLabels * 16 + 14 : 0;

        var maxR = Math.min(
          cx - 12,
          w - cx - 12,
          cy - 26,
          h - cy - legendH - 8
        );
        for (var si2 = 0; si2 < data.length; si2++) {
          if (si2 === si) continue;
          var ox = w * data[si2].px / 100;
          var oy = h * data[si2].py / 100;
          var dist = Math.sqrt((cx - ox) * (cx - ox) + (cy - oy) * (cy - oy));
          maxR = Math.min(maxR, (dist - 16) / 2);
        }
        maxR = Math.max(50, Math.min(maxR, 220));

        var radius = data[si].r > 0 ? Math.min(data[si].r, maxR) : maxR;

        var titleTxt = data[si].name || ('饼图' + (si + 1));
        ctx.fillStyle = getColor(0.85);
        ctx.font = 'bold 13px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(titleTxt, cx, cy - radius - 6);

        var startAngle = -Math.PI / 2;

        for (var j = 0; j < ps.length; j++) {
          var sliceAngle = (ps[j] / total) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = COLORS[j % COLORS.length];
          ctx.fill();
          ctx.strokeStyle = whiteBg.value ? '#cccccc' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          var midAngle = startAngle + sliceAngle / 2;
          var labelR = radius * 0.6;
          var lx = cx + Math.cos(midAngle) * labelR;
          var ly = cy + Math.sin(midAngle) * labelR;

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px ' + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(Math.round((ps[j] / total) * 100) + '%', lx, ly);

          startAngle += sliceAngle;
        }

        if (numLabels > 0) {
          var legendX = cx - radius;
          var legendY = cy + radius + 14;
          for (var k = 0; k < numLabels; k++) {
            ctx.fillStyle = COLORS[k % COLORS.length];
            ctx.fillRect(legendX, legendY + k * 16, 8, 8);
            ctx.fillStyle = getColor(0.55);
            ctx.font = '10px ' + getComputedStyle(document.body).fontFamily;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText((pl[k] || '') + ' (' + ps[k] + ')', legendX + 13, legendY + k * 16 + 4);
          }
        }
      }
    }

    function drawGrid(ctx, pad, cw, ch, maxVal) {
      var lines = 5;
      ctx.strokeStyle = getGridColor();
      ctx.lineWidth = 1;
      for (var i = 0; i <= lines; i++) {
        var y = pad.top + (ch / lines) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + cw, y);
        ctx.stroke();
        var val = Math.round(maxVal - (maxVal / lines) * i);
        ctx.fillStyle = getColor(0.4);
        ctx.font = '10px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(val, pad.left - 8, y);
      }
    }

    function drawLegend(ctx, pad, w, h, data, legendH) {
      if (data.length <= 1) return;
      var lx = pad.left;
      var ly = h - pad.bottom + 8;
      ctx.textBaseline = 'middle';
      var totalW = 0;
      var maxW = w - pad.left - pad.right;
      for (var i = 0; i < data.length; i++) {
        var text = data[i].name || ('系列' + (i + 1));
        ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
        var tw = ctx.measureText(text).width;
        var itemW = 16 + tw + 10;
        if (totalW + itemW > maxW && totalW > 0) {
          totalW = 0;
          ly += 18;
        }
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fillRect(lx + totalW, ly - 4, 10, 10);
        ctx.fillStyle = getColor(0.6);
        ctx.textAlign = 'left';
        ctx.fillText(text, lx + totalW + 14, ly + 1);
        totalW += itemW;
      }
    }

    function clearChart() {
      var c = document.getElementById('chartCanvas');
      if (!c) return;
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      showToast('已清空');
    }

    function saveChart() {
      var c = document.getElementById('chartCanvas');
      if (!c) return;
      var link = document.createElement('a');
      link.download = (chartTitle.value || 'chart') + '.png';
      link.href = c.toDataURL('image/png');
      link.click();
      showToast('已保存');
    }

    function addSeries() {
      var n = series.value.length + 1;
      var s = { name: '系列' + n, values: '' };
      if (chartType.value === 'pie') s.labels = '';
      series.value.push(s);
      if (chartType.value === 'pie') autoLayoutPies();
    }

    function removeSeries(index) {
      series.value.splice(index, 1);
    }

    function loadSample() {
      if (chartType.value === 'pie') {
        series.value = [
          { name: '浏览器份额', labels: 'Chrome,Firefox,Safari,Edge', values: '65,15,10,10', px: 25, py: 50 },
          { name: '系统占比', labels: 'Windows,macOS,Linux,其他', values: '50,25,15,10', px: 75, py: 50 }
        ];
      } else {
        labels.value = '一月,二月,三月,四月,五月,六月';
        series.value = [
          { name: '预算', values: '120,200,150,80,230,170' },
          { name: '实际', values: '100,180,160,90,210,150' }
        ];
      }
    }

    return {
      dark: dark,
      chartType: chartType,
      labels: labels,
      series: series,
      chartTitle: chartTitle,
      whiteBg: whiteBg,
      toast: toast,
      dataValid: dataValid,
      parsedLabels: parsedLabels,
      drawChart: drawChart,
      clearChart: clearChart,
      saveChart: saveChart,
      addSeries: addSeries,
      removeSeries: removeSeries,
      loadSample: loadSample
    };
  }
}).mount('#app');
