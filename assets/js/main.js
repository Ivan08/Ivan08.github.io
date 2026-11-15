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
      if (t.metric) b.appendChild(h('b', 'task-metric', t.metric));
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
    var cur = 0;

    var media = h('div', 'p-media');
    var main = h('button', 'p-main');
    main.type = 'button';
    main.setAttribute('aria-label', 'Увеличить скриншот: ' + p.name);
    var img = h('img');
    img.loading = 'lazy'; img.width = 1280; img.height = 800;
    main.appendChild(img);
    media.appendChild(main);

    var thumbs = h('div', 'p-thumbs');
    function show(i) {
      cur = i;
      img.src = 'assets/img/projects/' + p.shots[i][0] + '.webp';
      img.alt = p.shots[i][1];
      Array.prototype.forEach.call(thumbs.children, function (c, k) {
        c.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
    }
    p.shots.forEach(function (s, i) {
      var t = h('button', 'p-thumb');
      t.type = 'button';
      t.setAttribute('aria-label', s[1]);
      var ti = h('img');
      ti.src = 'assets/img/projects/' + s[0] + '.webp';
      ti.alt = ''; ti.loading = 'lazy'; ti.width = 1280; ti.height = 800;
      t.appendChild(ti);
      t.addEventListener('click', function () { show(i); });
      thumbs.appendChild(t);
    });
    media.appendChild(thumbs);
    main.addEventListener('click', function () { window.openShots(p.shots, cur); });
    show(0);
    card.appendChild(media);

    var body = h('div', 'p-body');
    body.appendChild(h('span', 'p-tag', p.tag));
    body.appendChild(h('h3', null, p.name));
    body.appendChild(h('p', 'p-text', p.text));
    body.appendChild(h('p', 'p-fact', p.fact));
    var tags = h('div', 'tags');
    p.stack.forEach(function (s) { tags.appendChild(h('span', 'tag', s)); });
    body.appendChild(tags);
    var links = h('div', 'p-links');
    p.links.forEach(function (l) {
      var a = h('a', null, l[1] + ' ↗');
      a.href = l[0]; a.target = '_blank'; a.rel = 'noopener';
      links.appendChild(a);
    });
    body.appendChild(links);
    card.appendChild(body);
    list.appendChild(card);
  });

  /* ---------- появление ---------- */
  var items = document.querySelectorAll('.stat, .axis, .project, .why-card, .head, .timeline, .contact');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('anim');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  Array.prototype.forEach.call(items, function (n) { io.observe(n); });
})();
