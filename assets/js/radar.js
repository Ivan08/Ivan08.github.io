/* Круг компетенций: SVG, рисуется из SITE.AXES и SITE.TASKS. */
(function () {
  var S = window.SITE;
  var NS = 'http://www.w3.org/2000/svg';
  var host = document.getElementById('radar');
  if (!host) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function build(compact) {
    host.textContent = '';
    var W = compact ? 400 : 640, H = compact ? 410 : 590;
    var R = compact ? 118 : 205, cx = W / 2, cy = H / 2 + (compact ? 2 : 4);
    var fs = compact ? 12.5 : 15;
    var n = S.AXES.length;

    function pt(i, v) {
      var a = (-90 + i * 360 / n) * Math.PI / 180;
      return [cx + Math.cos(a) * R * v / 100, cy + Math.sin(a) * R * v / 100];
    }
    function poly(v) {
      return S.AXES.map(function (ax, i) {
        var p = pt(i, typeof v === 'function' ? v(ax) : v);
        return p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ');
    }

    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Круг компетенций: восемь направлений, мой уровень выше уровня Senior по каждому' }, host);

    [20, 40, 60, 80, 100].forEach(function (v) {
      svg('polygon', { points: poly(v), class: 'r-ring' + (v === 100 ? ' r-ring-out' : '') }, root);
    });
    S.AXES.forEach(function (ax, i) {
      var p = pt(i, 100);
      svg('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], class: 'r-axis' }, root);
    });

    var me = svg('polygon', { points: poly(0), class: 'r-me' }, root);
    svg('polygon', { points: poly(S.SENIOR), class: 'r-senior' }, root);

    /* подпись пунктира — между первой и последней осью */
    var a0 = pt(0, S.SENIOR), a7 = pt(n - 1, S.SENIOR);
    var sl = svg('text', { x: (a0[0] + a7[0]) / 2 - 2, y: (a0[1] + a7[1]) / 2 + 4,
      class: 'r-senior-label', 'text-anchor': 'middle', 'font-size': fs * 0.74 }, root);
    sl.textContent = 'SENIOR';

    /* подписи осей */
    S.AXES.forEach(function (ax, i) {
      var p = pt(i, 100 + (compact ? 13 : 10));
      var cos = Math.cos((-90 + i * 360 / n) * Math.PI / 180);
      var anchor = Math.abs(cos) < 0.3 ? 'middle' : (cos > 0 ? 'start' : 'end');
      var lines = ax.label;
      var sin = Math.sin((-90 + i * 360 / n) * Math.PI / 180);
      var y0 = p[1] - (lines.length - 1) * fs * 0.6 + fs * 0.35 + (sin < -0.5 ? -fs * 0.5 * (lines.length - 1) : sin > 0.5 ? fs * 0.6 * (lines.length - 1) : 0);
      var t = svg('text', { x: p[0], y: y0, class: 'r-label', 'text-anchor': anchor, 'font-size': fs }, root);
      lines.forEach(function (ln, k) {
        var ts = svg('tspan', { x: p[0], dy: k === 0 ? 0 : fs * 1.2 }, t);
        ts.textContent = ln;
      });
    });

    /* точки-задачи */
    var dots = svg('g', { class: 'r-dots' }, root);
    S.AXES.forEach(function (ax, i) {
      var list = S.TASKS.filter(function (t) { return t.axis === ax.id; });
      var lo = 34, hi = ax.level - 7;
      list.forEach(function (t, k) {
        var v = list.length === 1 ? hi : lo + (hi - lo) * k / (list.length - 1);
        /* первые задачи — самые сильные, ставим их дальше от центра */
        v = lo + hi - v;
        var p = pt(i, v);
        var g = svg('g', { class: 'r-dot', tabindex: 0, role: 'button', 'data-task': t.id,
          'data-tip': t.metric ? t.title + ' · ' + t.metric : t.title,
          'aria-label': t.title, style: '--d:' + (i * 60 + k * 90) + 'ms' }, dots);
        svg('circle', { cx: p[0], cy: p[1], r: compact ? 13 : 15, class: 'r-hit' }, g);
        svg('circle', { cx: p[0], cy: p[1], r: compact ? 5.2 : 6.5, class: 'r-pin' }, g);
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.openTask(t.id); }
        });
      });
    });

    /* рост фигуры из центра */
    var target = function (ax) { return ax.level; };
    if (reduce) {
      me.setAttribute('points', poly(target));
      root.classList.add('ready');
      return;
    }
    var t0 = null, dur = 1100;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      me.setAttribute('points', poly(function (ax) { return ax.level * e; }));
      if (k < 1) requestAnimationFrame(frame); else root.classList.add('ready');
    }
    setTimeout(function () { requestAnimationFrame(frame); }, 250);
  }

  var mq = window.matchMedia('(max-width: 560px)');
  build(mq.matches);
  var onChange = function () { build(mq.matches); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
})();
