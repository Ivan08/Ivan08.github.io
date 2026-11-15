/* Лента пути: этапы из SITE.JOBS, точки — задачи с тем же job. */
(function () {
  var S = window.SITE, h = window.h;
  var host = document.getElementById('timeline');
  if (!host) return;

  /* Шкала из двух частей: годы до разработки сжаты, чтобы короткие этапы после 2016 были читаемы. */
  var FROM = 2007.5, MID = 2016, TO = 2027.3, MIDP = 30;
  function pos(y) {
    return y <= MID ? (y - FROM) / (MID - FROM) * MIDP : MIDP + (y - MID) / (TO - MID) * (100 - MIDP);
  }
  function pct(y) { return pos(y).toFixed(3) + '%'; }

  var lanes = [h('div', 'tl-lane tl-lane-main'), h('div', 'tl-lane tl-lane-side')];

  S.JOBS.forEach(function (j) {
    var seg = h('article', 'tl-seg' + (j.kind ? ' tl-' + j.kind : ''));
    seg.style.setProperty('--l', pct(j.from));
    seg.style.setProperty('--w', (pos(j.to) - pos(j.from)).toFixed(3) + '%');
    seg.style.setProperty('--o', Math.round((TO - j.from) * 10));
    seg.title = j.name + ' · ' + j.years + ' · ' + j.role;

    var head = h('div', 'tl-head');
    head.appendChild(h('span', 'tl-years', j.years));
    head.appendChild(h('b', 'tl-name', j.name));
    head.appendChild(h('span', 'tl-role', j.role));
    seg.appendChild(head);

    var tasks = S.TASKS.filter(function (t) { return t.job === j.id; });
    if (tasks.length) {
      var dots = h('div', 'tl-dots');
      tasks.forEach(function (t) {
        var b = h('button', 'tl-dot');
        b.type = 'button';
        b.setAttribute('data-task', t.id);
        b.setAttribute('data-tip', t.metric ? t.title + ' · ' + t.metric : t.title);
        b.setAttribute('aria-label', t.title);
        b.appendChild(h('i'));
        b.appendChild(h('span', null, t.title));
        dots.appendChild(b);
      });
      seg.appendChild(dots);
    }
    lanes[j.lane].appendChild(seg);
  });

  var track = h('div', 'tl-track');
  track.appendChild(lanes[1]);
  track.appendChild(lanes[0]);

  var axis = h('div', 'tl-axis');
  for (var y = 2008; y <= 2026; y += 2) {
    var tick = h('span', 'tl-tick', String(y));
    tick.style.left = pct(y);
    axis.appendChild(tick);
  }
  track.appendChild(axis);
  host.appendChild(track);
})();
