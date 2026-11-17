/* Лента пути: прокручиваемая лента по годам + мини-карта всего пути.
   Этапы — SITE.JOBS, метки — задачи с тем же job. По умолчанию видны последние годы. */
(function () {
  var S = window.SITE, h = window.h;
  var host = document.getElementById('timeline');
  if (!host) return;

  var FROM = 2009.2, TO = 2026.95, VISIBLE_YEARS = 5.3, MIN_PPY = 170;
  var ROW_H = 36, BAR_H = 54, CHIP_GAP = 12;

  var view = h('div', 'tl-view');
  view.tabIndex = 0;
  view.setAttribute('role', 'region');
  view.setAttribute('aria-label', 'Опыт работы по годам');
  var canvas = h('div', 'tl-canvas');
  view.appendChild(canvas);

  var controls = h('div', 'tl-controls');
  var prev = h('button', 'tl-btn', '← Раньше'); prev.type = 'button';
  var next = h('button', 'tl-btn', 'Позже →'); next.type = 'button';
  var range = h('span', 'tl-range');
  controls.appendChild(prev); controls.appendChild(range); controls.appendChild(next);

  var mapWrap = h('div', 'tl-mapwrap');
  var map = h('div', 'tl-map');
  var win = h('div', 'tl-win');
  mapWrap.appendChild(map);

  var desk = h('div', 'tl-desk');
  desk.appendChild(controls);
  desk.appendChild(view);
  desk.appendChild(mapWrap);
  host.appendChild(desk);

  function chipWidth(t) { return Math.min(230, Math.round((t.short || t.title).length * 7.6 + 40)); }

  /* раскладка меток внутри этапа: ряды со сдвигом, чтобы подписи не перекрывались */
  function layout(tasks, width) {
    var n = tasks.length;
    var cw = Math.max.apply(null, tasks.map(chipWidth)) + CHIP_GAP;
    for (var rows = 1; rows <= n; rows++) {
      var cols = Math.ceil(n / rows);
      var colW = cols === 1 ? width : (width - 8) / (cols + (rows - 1) / rows);
      if (colW >= cw || rows === n) {
        return tasks.map(function (t, i) {
          var r = i % rows, c = Math.floor(i / rows);
          var x = cols === 1 ? 0 : c * colW + r * colW / rows;
          return { task: t, row: r, x: Math.max(0, Math.min(x, Math.max(0, width - chipWidth(t)))) };
        }).concat([{ rows: rows }]);
      }
    }
    return [{ rows: 1 }];
  }

  var ppy = 0;
  function X(y) { return (y - FROM) * ppy; }

  function render() {
    var w = view.clientWidth;
    if (!w) return; /* лента скрыта — на телефоне показывается список */
    var newPpy = Math.max(MIN_PPY, Math.round(w / VISIBLE_YEARS));
    if (newPpy === ppy) return;
    var keepEnd = !ppy || view.scrollLeft + view.clientWidth >= view.scrollWidth - 4;
    var centerYear = ppy ? FROM + (view.scrollLeft + view.clientWidth / 2) / ppy : null;
    ppy = newPpy;

    canvas.textContent = '';
    canvas.style.width = Math.round((TO - FROM) * ppy) + 'px';

    var grid = h('div', 'tl-grid');
    for (var y = Math.ceil(FROM); y <= Math.floor(TO); y++) {
      var line = h('div', 'tl-year');
      line.style.left = X(y) + 'px';
      line.appendChild(h('span', null, String(y)));
      grid.appendChild(line);
    }
    canvas.appendChild(grid);

    [1, 0].forEach(function (laneNo) {
      var lane = h('div', 'tl-lane tl-lane-' + laneNo);
      var maxRows = 1;
      S.JOBS.filter(function (j) { return j.lane === laneNo; }).forEach(function (j) {
        var left = X(j.from), width = X(j.to) - left - 6;
        var job = h('section', 'tl-job' + (j.kind ? ' tl-' + j.kind : ''));
        job.style.left = left + 'px';
        job.style.width = width + 'px';

        var bar = h('div', 'tl-bar');
        var label = h('div', 'tl-label');
        label.appendChild(h('b', null, j.name));
        label.appendChild(h('span', 'tl-years', j.years));
        label.appendChild(h('span', 'tl-role', j.role));
        bar.appendChild(label);
        job.appendChild(bar);

        var tasks = S.TASKS.filter(function (t) { return t.job === j.id; });
        var placed = layout(tasks, width);
        var rows = placed.pop().rows;
        maxRows = Math.max(maxRows, rows);
        var chips = h('div', 'tl-chips');
        placed.forEach(function (p) {
          var b = h('button', 'tl-chip');
          b.type = 'button';
          b.setAttribute('data-task', p.task.id);
          if (p.task.short && p.task.short !== p.task.title) b.setAttribute('data-tip', p.task.title);
          b.style.left = p.x + 'px';
          b.style.top = p.row * ROW_H + 'px';
          b.appendChild(h('i'));
          b.appendChild(h('span', null, p.task.short || p.task.title));
          chips.appendChild(b);
        });
        job.appendChild(chips);
        lane.appendChild(job);
      });
      lane.style.height = BAR_H + maxRows * ROW_H + 14 + 'px';
      canvas.appendChild(lane);
    });

    if (keepEnd || centerYear === null) view.scrollLeft = view.scrollWidth;
    else view.scrollLeft = X(centerYear) - view.clientWidth / 2;
    sync();
  }

  /* ---------- мини-карта ---------- */
  function P(y) { return ((y - FROM) / (TO - FROM) * 100).toFixed(3) + '%'; }
  function fillMap(target) {
    S.JOBS.forEach(function (j) {
      var seg = h('div', 'tl-mseg tl-mlane-' + j.lane + (j.kind ? ' tl-m' + j.kind : ''));
      seg.style.left = P(j.from);
      seg.style.width = ((j.to - j.from) / (TO - FROM) * 100).toFixed(3) + '%';
      seg.appendChild(h('span', null, j.name));
      target.appendChild(seg);
    });
    [2010, 2014, 2018, 2022, 2026].forEach(function (y) {
      var t = h('span', 'tl-mtick', String(y));
      t.style.left = P(y);
      target.appendChild(t);
    });
  }
  fillMap(map);
  map.appendChild(win);

  /* ---------- телефон: список по этапам, ранний опыт свёрнут ---------- */
  var RECENT = 2021.6;
  var mob = h('div', 'tl-mob');
  var mmap = h('div', 'tl-map tl-map-static');
  fillMap(mmap);
  var mwin = h('div', 'tl-win');
  mwin.style.left = P(RECENT);
  mwin.style.right = '0';
  mmap.appendChild(mwin);
  mob.appendChild(mmap);
  var older = h('div', 'tl-older');
  older.hidden = true;
  S.JOBS.slice().sort(function (a, b) { return b.from - a.from; }).forEach(function (j) {
    var card = h('section', 'tl-card' + (j.kind ? ' tl-' + j.kind : ''));
    var head = h('div', 'tl-cardhead');
    head.appendChild(h('span', 'tl-years', j.years));
    head.appendChild(h('b', null, j.name));
    head.appendChild(h('span', 'tl-role', j.role));
    card.appendChild(head);
    var chips = h('div', 'tl-cardchips');
    S.TASKS.filter(function (t) { return t.job === j.id; }).forEach(function (t) {
      var b = h('button', 'tl-chip');
      b.type = 'button';
      b.setAttribute('data-task', t.id);
      b.appendChild(h('i'));
      b.appendChild(h('span', null, t.short || t.title));
      chips.appendChild(b);
    });
    card.appendChild(chips);
    (j.to > RECENT ? mob : older).appendChild(card);
  });
  var moreBtn = h('button', 'btn btn-ghost tl-more', 'Ранний опыт: 2009–2019');
  moreBtn.type = 'button';
  moreBtn.addEventListener('click', function () {
    older.hidden = false;
    moreBtn.hidden = true;
  });
  mob.appendChild(moreBtn);
  mob.appendChild(older);
  host.appendChild(mob);

  function sync() {
    var sw = view.scrollWidth || 1;
    win.style.left = (view.scrollLeft / sw * 100) + '%';
    win.style.width = (view.clientWidth / sw * 100) + '%';
    var a = FROM + view.scrollLeft / ppy, b = FROM + (view.scrollLeft + view.clientWidth) / ppy;
    range.textContent = Math.max(2009, Math.floor(a)) + ' — ' + Math.min(2026, Math.floor(b));
    prev.disabled = view.scrollLeft <= 2;
    next.disabled = view.scrollLeft + view.clientWidth >= sw - 2;
  }
  view.addEventListener('scroll', sync, { passive: true });

  function jump(clientX) {
    var r = map.getBoundingClientRect();
    var k = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    view.scrollLeft = k * view.scrollWidth - view.clientWidth / 2;
  }
  var dragging = false;
  map.addEventListener('pointerdown', function (e) {
    dragging = true;
    map.setPointerCapture(e.pointerId);
    map.classList.add('drag');
    jump(e.clientX);
  });
  map.addEventListener('pointermove', function (e) { if (dragging) jump(e.clientX); });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    map.addEventListener(ev, function () { dragging = false; map.classList.remove('drag'); });
  });

  function page(d) {
    view.scrollBy({ left: d * view.clientWidth * 0.8, behavior: 'smooth' });
  }
  prev.addEventListener('click', function () { page(-1); });
  next.addEventListener('click', function () { page(1); });

  /* перетаскивание ленты мышью */
  var grab = null, moved = false;
  view.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    grab = { x: e.clientX, left: view.scrollLeft };
    moved = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!grab) return;
    var dx = e.clientX - grab.x;
    if (Math.abs(dx) > 5) { moved = true; view.classList.add('drag'); }
    if (moved) view.scrollLeft = grab.left - dx;
  });
  window.addEventListener('pointerup', function () {
    grab = null;
    setTimeout(function () { view.classList.remove('drag'); moved = false; }, 0);
  });
  view.addEventListener('click', function (e) {
    if (moved) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  render();
  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
})();
