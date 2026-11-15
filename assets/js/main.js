/* Карточки осей, проекты, появление блоков. */
(function () {
  var S = window.SITE, h = window.h;

  /* ---------- оси ---------- */
  var axes = document.getElementById('axes');
  S.AXES.forEach(function (ax) {
    var card = h('article', 'axis');
    card.appendChild(h('h3', null, ax.label.join(' ')));
    card.appendChild(h('p', 'axis-about', ax.about));

    var bar = h('div', 'lvl');
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', 'Мой уровень выше уровня Senior');
    var fill = h('i', 'lvl-fill');
    fill.style.setProperty('--v', ax.level + '%');
    bar.appendChild(fill);
    var mark = h('i', 'lvl-senior');
    mark.style.left = S.SENIOR + '%';
    bar.appendChild(mark);
    card.appendChild(bar);

    var tasks = h('div', 'axis-tasks');
    S.TASKS.filter(function (t) { return t.axis === ax.id; }).forEach(function (t) {
      var b = h('button', 'task');
      b.type = 'button';
      b.setAttribute('data-task', t.id);
      b.appendChild(h('span', 'task-title', t.title));
      var m = t.pairs ? t.pairs[0].after : (t.project ? null : t.metric);
      if (m && m.length <= 10) b.appendChild(h('b', 'task-metric', m));
      tasks.appendChild(b);
    });
    card.appendChild(tasks);

    var tags = h('div', 'tags');
    ax.stack.forEach(function (s) { tags.appendChild(h('span', 'tag', s)); });
    card.appendChild(tags);
    axes.appendChild(card);
  });

  /* ---------- проекты ---------- */
  var list = document.getElementById('projects-list');
  S.PROJECTS.forEach(function (p, idx) {
    var card = h('article', 'project' + (idx === 0 ? ' project-wide' : ''));

    var media = h('button', 'p-main');
    media.type = 'button';
    media.setAttribute('data-project', p.id);
    media.setAttribute('aria-label', 'Подробнее о проекте ' + p.name);
    var img = h('img');
    img.src = window.shotSrc(p.shots[0][0]);
    img.alt = p.shots[0][1];
    img.width = 1280; img.height = 800;
    media.appendChild(img);
    media.appendChild(h('span', 'p-count', p.shots.length + ' скриншота'));
    card.appendChild(media);

    var body = h('div', 'p-body');
    var top = h('div', 'p-top');
    top.appendChild(h('span', 'p-tag', p.tag));
    top.appendChild(h('span', 'p-status', p.status));
    body.appendChild(top);
    body.appendChild(h('h3', null, p.name));
    body.appendChild(h('p', 'p-problem', p.problem));

    var ul = h('ul', 'p-features');
    p.features.slice(0, idx === 0 ? 5 : 3).forEach(function (f) { ul.appendChild(h('li', null, f)); });
    body.appendChild(ul);

    var tags = h('div', 'tags');
    p.stack.forEach(function (s) { tags.appendChild(h('span', 'tag', s)); });
    body.appendChild(tags);

    var foot = h('div', 'p-foot');
    var more = h('button', 'btn btn-sm', 'Подробнее');
    more.type = 'button';
    more.setAttribute('data-project', p.id);
    foot.appendChild(more);
    p.links.slice(0, 2).forEach(function (l) {
      var a = h('a', 'p-link', l[1] + ' ↗');
      a.href = l[0]; a.target = '_blank'; a.rel = 'noopener';
      foot.appendChild(a);
    });
    body.appendChild(foot);
    card.appendChild(body);
    list.appendChild(card);
  });

  /* ---------- меню на узких экранах ---------- */
  var top = document.querySelector('.top'), mb = document.getElementById('menu-btn');
  function setMenu(open) {
    top.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  mb.addEventListener('click', function () { setMenu(!top.classList.contains('open')); });
  document.addEventListener('click', function (e) {
    if (!top.classList.contains('open')) return;
    if (e.target.closest('.nav a') || !e.target.closest('.top')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- появление ---------- */
  var items = document.querySelectorAll('.stat, .focus-card, .axis, .project, .gain, .head, .timeline, .contact');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('anim');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(items, function (n) { io.observe(n); });
})();
