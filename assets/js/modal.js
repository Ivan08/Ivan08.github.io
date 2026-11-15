/* Модалки задачи и проекта, просмотр скриншотов, всплывающая подпись. */
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

  function shotSrc(name) { return 'assets/img/projects/' + name + '.webp'; }
  window.shotSrc = shotSrc;

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

  function fillTask(id) {
    var t = S.task[id];
    if (!t) return;
    current = order.indexOf(id);
    $('tm-where').textContent = t.where;
    $('tm-title').textContent = t.title;

    var m = $('tm-metric');
    m.textContent = '';
    m.className = 'tm-metric';
    m.hidden = !(t.metric || t.pairs);
    if (t.pairs) {
      m.className = 'tm-pairs';
      t.pairs.forEach(function (p) {
        var row = el('div', 'pair');
        row.appendChild(el('p', 'pair-label', p.label));
        var was = el('div', 'pair-side pair-was');
        was.appendChild(el('span', null, 'Было'));
        was.appendChild(el('b', null, p.before));
        var arrow = el('div', 'pair-arrow', '→');
        arrow.setAttribute('aria-hidden', 'true');
        var now = el('div', 'pair-side pair-now');
        now.appendChild(el('span', null, 'Стало'));
        now.appendChild(el('b', null, p.after));
        row.appendChild(was); row.appendChild(arrow); row.appendChild(now);
        m.appendChild(row);
      });
    } else if (t.metric) {
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

    var pr = t.project && S.project[t.project];
    if (pr) {
      var img = el('img', 'tm-shot');
      img.src = shotSrc(pr.shots[0][0]);
      img.alt = pr.shots[0][1];
      img.width = 1280; img.height = 800;
      body.appendChild(img);
    }

    var st = $('tm-stack');
    st.textContent = '';
    (t.stack || []).forEach(function (s) { st.appendChild(el('span', 'tag', s)); });

    var a = $('tm-link');
    a.hidden = !pr;
    if (pr) { a.setAttribute('data-project', pr.id); a.textContent = 'Подробнее о проекте'; }

    $('tm-count').textContent = (current + 1) + ' / ' + order.length;
    dlg.querySelector('.modal-in').scrollTop = 0;
  }

  window.openTask = function (id) {
    fillTask(id);
    if (!dlg.open) dlg.showModal();
  };
  function step(d) { fillTask(order[(current + d + order.length) % order.length]); }
  $('tm-prev').addEventListener('click', function () { step(-1); });
  $('tm-next').addEventListener('click', function () { step(1); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- проект ---------- */
  var pd = $('project-modal'), pcur = null, pshot = 0;
  wireDialog(pd);

  function showProjectShot(i) {
    pshot = i;
    var s = pcur.shots[i];
    $('pm-img').src = shotSrc(s[0]);
    $('pm-img').alt = s[1];
    $('pm-cap').textContent = s[1];
    Array.prototype.forEach.call($('pm-thumbs').children, function (c, k) {
      c.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
  }

  window.openProject = function (id) {
    var p = S.project[id];
    if (!p) return;
    pcur = p;
    $('pm-tag').textContent = p.tag;
    $('pm-title').textContent = p.name;
    $('pm-status').textContent = p.status;
    $('pm-problem').textContent = p.problem;
    $('pm-text').textContent = p.text;
    $('pm-role').textContent = p.role;

    var th = $('pm-thumbs');
    th.textContent = '';
    p.shots.forEach(function (s, i) {
      var b = el('button', 'p-thumb');
      b.type = 'button';
      b.setAttribute('aria-label', s[1]);
      var ti = el('img');
      ti.src = shotSrc(s[0]); ti.alt = ''; ti.width = 1280; ti.height = 800;
      b.appendChild(ti);
      b.addEventListener('click', function () { showProjectShot(i); });
      th.appendChild(b);
    });
    showProjectShot(0);

    var f = $('pm-features');
    f.textContent = '';
    p.features.forEach(function (x) { f.appendChild(el('li', null, x)); });

    var parts = $('pm-parts');
    parts.textContent = '';
    p.parts.forEach(function (x) { parts.appendChild(el('span', 'tag', x)); });

    var links = $('pm-links');
    links.textContent = '';
    p.links.forEach(function (l, i) {
      var a = el('a', i === 0 ? 'btn btn-sm' : 'btn btn-sm btn-ghost', l[1] + ' ↗');
      a.href = l[0]; a.target = '_blank'; a.rel = 'noopener';
      links.appendChild(a);
    });

    if (dlg.open) dlg.close();
    if (!pd.open) pd.showModal();
    pd.querySelector('.modal-in').scrollTop = 0;
  };
  $('pm-zoom').addEventListener('click', function () { window.openShots(pcur.shots, pshot); });

  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-project]');
    if (p) { e.preventDefault(); window.openProject(p.getAttribute('data-project')); return; }
    var b = e.target.closest('[data-task]');
    if (b) { e.preventDefault(); window.openTask(b.getAttribute('data-task')); }
  });

  /* ---------- скриншоты ---------- */
  var lb = $('lightbox'), shots = [], si = 0;
  wireDialog(lb);
  function showShot() {
    var s = shots[si];
    $('lb-img').src = shotSrc(s[0]);
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
