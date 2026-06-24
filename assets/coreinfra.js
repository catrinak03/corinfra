/* ============================================================
   CoreInfra — shared interactions
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---- Nav: scrolled state + mobile toggle ---- */
    var nav = document.querySelector('.site-nav');
    var links = document.querySelector('.nav-links');
    var toggle = document.querySelector('.menu-toggle');

    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); toggle.classList.remove('active'); });
      });
    }

    /* ---- Scroll reveal ---- */
    var revs = document.querySelectorAll('.reveal');
    if (revs.length) {
      if (reduce || !('IntersectionObserver' in window)) {
        revs.forEach(function (el) { el.classList.add('in'); });
      } else {
        var ro = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        revs.forEach(function (el) { ro.observe(el); });
      }
    }

    /* ---- Animated SVG path(s) (timeline draw) ---- */
    document.querySelectorAll('[data-draw]').forEach(function (path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = reduce ? 0 : len;
      if (reduce) return;
      var po = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            path.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.22,1,0.36,1)';
            path.style.strokeDashoffset = '0';
            po.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 });
      po.observe(path);
    });

    /* ---- Count-up stats ---- */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          co.unobserve(el);
          var target = parseFloat(el.getAttribute('data-count'));
          var dec = (el.getAttribute('data-dec') | 0);
          var dur = 1400, t0 = null;
          if (reduce) { el.textContent = target.toFixed(dec); return; }
          function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(dec);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toFixed(dec);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { co.observe(c); });
    }

    /* ---- Smooth anchor scroll without hash pollution ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var t = document.getElementById(id);
        if (!t) return;
        ev.preventDefault();
        var y = t.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    /* ---- Hero parallax (subtle) ---- */
    var pl = document.querySelector('[data-parallax]');
    if (pl && !reduce) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y < window.innerHeight) pl.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0) scale(1.08)';
      }, { passive: true });
    }

    /* ---- Lazy-load map iframe ---- */
    var map = document.getElementById('gmap');
    if (map && map.getAttribute('data-src')) {
      var load = function () { map.src = map.getAttribute('data-src'); };
      if ('IntersectionObserver' in window) {
        var mo = new IntersectionObserver(function (en) {
          en.forEach(function (e) { if (e.isIntersecting) { load(); mo.disconnect(); } });
        }, { rootMargin: '200px' });
        mo.observe(map);
      } else { load(); }
    }

    /* ---- Clean stray hash on load ---- */
    if (window.location.hash) {
      setTimeout(function () {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }, 10);
    }
  });
})();
