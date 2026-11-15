/* Модалка задачи, просмотр скриншотов и всплывающая подпись. */
(function () {
  var S = window.SITE;
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  window.h = el;

  function wireDialog(dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    });
  }

  /* ---------- задача ---------- */
  var dlg = $('task-modal');
  var order = S.TASKS.map(function (t) { return t.id; });
  var current = 0;
  wireDialog(dlg);

  function fill(id) {
    var t = S.task[id];
    if (!t) return;
    current = order.indexOf(id);
    $('tm-where').textContent = t.where;
    $('tm-title').textContent = t.title;

    var m = $('tm-metric');
    m.textContent = '';
    m.hidden = !t.metric;
    if (t.metric) {
      m.appendChild(el('b', null, t.metric));
      m.appendChild(el('span', null, t.metricNote || ''));
    }

    var body = $('tm-body');
    body.textContent = '';
    [['Условия', t.context], ['Что сделал', t.did], ['Результат', t.result]].forEach(function (p) {
      if (!p[1]) return;
      var row = el('div', 'tm-row');
      row.appendChild(el('h4', null, p[0]));
      row.appendChild(el('p', null, p[1]));
      body.appendChild(row);
    });

    if (t.project) {
      var pr = S.PROJECTS.filter(function (p) { return p.id === t.project; })[0];
      if (pr) {
        var img = el('img', 'tm-shot');
        img.src = 'assets/img/projects/' + pr.shots[0][0] + '.webp';
        img.alt = pr.shots[0][1];
        img.loading = 'lazy';
        img.width = 1280; img.height = 800;
        body.appendChild(img);
      }
    }

    var st = $('tm-stack');
    st.textContent = '';
    (t.stack || []).forEach(function (s) { st.appendChild(el('span', 'tag', s)); });

    var a = $('tm-link');
    a.hidden = !t.link;
    if (t.link) { a.href = t.link.href; a.textContent = t.link.label + ' ↗'; }

    $('tm-count').textContent = (current + 1) + ' / ' + order.length;
    dlg.querySelector('.modal-in').scrollTop = 0;
  }

  window.openTask = function (id) {
    fill(id);
    if (!dlg.open) dlg.showModal();
  };
  function step(d) { fill(order[(current + d + order.length) % order.length]); }
  $('tm-prev').addEventListener('click', function () { step(-1); });
  $('tm-next').addEventListener('click', function () { step(1); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-task]');
    if (b) { e.preventDefault(); window.openTask(b.getAttribute('data-task')); }
  });

  /* ---------- скриншоты ---------- */
  var lb = $('lightbox'), shots = [], si = 0;
  wireDialog(lb);
  function showShot() {
    var s = shots[si];
    $('lb-img').src = 'assets/img/projects/' + s[0] + '.webp';
    $('lb-img').alt = s[1];
    $('lb-cap').textContent = s[1] + ' · ' + (si + 1) + ' / ' + shots.length;
    var one = shots.length < 2;
    $('lb-prev').hidden = one; $('lb-next').hidden = one;
  }
  function shotStep(d) { si = (si + d + shots.length) % shots.length; showShot(); }
  window.openShots = function (list, idx) {
    shots = list; si = idx || 0; showShot();
    if (!lb.open) lb.showModal();
  };
  $('lb-prev').addEventListener('click', function () { shotStep(-1); });
  $('lb-next').addEventListener('click', function () { shotStep(1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') shotStep(-1);
    if (e.key === 'ArrowRight') shotStep(1);
  });

  /* ---------- подпись при наведении ---------- */
  var tip = $('tip');
  function showTip(target) {
    var text = target.getAttribute('data-tip');
    if (!text) return;
    tip.textContent = text;
    tip.hidden = false;
    var r = target.getBoundingClientRect();
    var w = tip.offsetWidth, hgt = tip.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var y = r.top - hgt - 10;
    if (y < 8) y = r.bottom + 10;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hideTip() { tip.hidden = true; }
  ['mouseover', 'focusin'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest && e.target.closest('[data-tip]');
      if (t) showTip(t);
    });
  });
  ['mouseout', 'focusout'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.target.closest && e.target.closest('[data-tip]')) hideTip();
    });
  });
  window.addEventListener('scroll', hideTip, { passive: true });
})();
