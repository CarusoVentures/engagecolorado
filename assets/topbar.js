(function () {
  var bar = document.getElementById('topbar');
  if (!bar) return;

  var onScroll = function () {
    bar.classList.toggle('topbar--scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = bar.querySelector('.topbar-toggle');
  var links = bar.querySelector('.topbar-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
