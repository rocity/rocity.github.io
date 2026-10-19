// Site motion and interaction. No dependencies.
//
//   data-split          split an element's rendered lines into rising masks
//   data-reveal="..."   lines | fade | media — animate in when scrolled to
//   data-roll           odometer digits
//   data-more           collapse a long list behind "Show More"
//   .acc__btn           accordion rows
//   data-reel           crossfading portfolio reel in the home hero
//   .wipe               ink panel between page loads

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('motion');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toArray = function (list) { return Array.prototype.slice.call(list); };
  var $$ = function (selector, scope) { return toArray((scope || document).querySelectorAll(selector)); };


  /* Line splitting --------------------------------------------------------- */

  // Wraps each rendered line of `el` in an overflow-hidden mask. Text is split
  // by word; inline elements (links, <strong>, ornaments) stay whole. Once the
  // reveal has played, the original markup is restored so text reflows
  // naturally on resize.
  function splitLines(el) {
    var original = el.innerHTML;

    toArray(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(' '));
        } else {
          var word = document.createElement('span');
          word.textContent = part;
          fragment.appendChild(word);
        }
      });
      el.replaceChild(fragment, node);
    });

    var lines = [];
    var current = null;
    var lastTop = null;
    toArray(el.childNodes).forEach(function (node) {
      if (node.nodeName === 'BR') return el.removeChild(node);
      if (node.nodeType === 1 && (lastTop === null || node.offsetTop > lastTop + 2)) {
        lastTop = node.offsetTop;
        current = [];
        lines.push(current);
      }
      if (current) current.push(node);
    });

    el.textContent = '';
    lines.forEach(function (nodes, i) {
      var mask = document.createElement('span');
      var inner = document.createElement('span');
      mask.className = 'line';
      inner.style.setProperty('--i', i);
      nodes.forEach(function (node) { inner.appendChild(node); });
      mask.appendChild(inner);
      el.appendChild(mask);
      el.appendChild(document.createTextNode(' '));
    });

    el.classList.add('is-split');
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'lines');

    el.addEventListener('revealed', function () {
      var delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout(function () { el.innerHTML = original; }, (delay + 0.1 * lines.length + 2) * 1000);
    }, { once: true });
  }


  /* Rolling numbers ------------------------------------------------------- */

  function buildRoll(el) {
    var value = el.textContent.trim();
    el.textContent = '';

    var label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = value;
    el.appendChild(label);

    value.split('').forEach(function (char, i) {
      if (!/\d/.test(char)) {
        el.appendChild(document.createTextNode(char));
        return;
      }
      var col = document.createElement('span');
      var strip = document.createElement('span');
      col.className = 'roll__col';
      col.setAttribute('aria-hidden', 'true');
      strip.className = 'roll__strip';
      // Two passes of 0–9 so every digit travels, even a zero.
      for (var n = 0; n < 20; n++) {
        var digit = document.createElement('span');
        digit.textContent = n % 10;
        strip.appendChild(digit);
      }
      strip.style.setProperty('--n', 10 + Number(char));
      strip.style.setProperty('--i', i);
      col.appendChild(strip);
      el.appendChild(col);
    });
  }


  /* Reveal on scroll ------------------------------------------------------- */

  function reveal(el) {
    el.classList.add('is-in');
    el.dispatchEvent(new CustomEvent('revealed'));
    if (el.getAttribute('data-reveal') === 'media') {
      setTimeout(function () { el.classList.add('is-done'); }, 1900);
    }
  }

  function observeReveals() {
    var targets = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(reveal);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) {
      // Anything on the first screen plays as part of the intro, even if it
      // sits inside the observer's bottom margin.
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      else observer.observe(el);
    });
  }


  /* Show more -------------------------------------------------------------- */

  $$('[data-more]').forEach(function (list) {
    var limit = Number(list.getAttribute('data-more'));
    var button = document.querySelector('[aria-controls="' + list.id + '"][data-more-toggle]');
    var hidden = toArray(list.children).slice(limit);
    if (!button || !hidden.length) return;

    hidden.forEach(function (item) { item.hidden = true; });
    button.hidden = false;

    button.addEventListener('click', function () {
      hidden.forEach(function (item, i) {
        item.hidden = false;
        item.setAttribute('data-reveal', 'fade');
        item.style.setProperty('--d', (i * 0.08) + 's');
        requestAnimationFrame(function () { requestAnimationFrame(function () { reveal(item); }); });
      });
      button.setAttribute('aria-expanded', 'true');
      button.parentNode.hidden = true;
      hidden[0].querySelector('a').focus({ preventScroll: true });
    });
  });


  /* Accordion -------------------------------------------------------------- */

  $$('.acc__btn').forEach(function (button) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
  });


  /* Hero reel -------------------------------------------------------------- */

  // Crossfades the portfolio screenshots. Holds still on hover/focus, while
  // off-screen, and entirely under reduced motion.
  $$('[data-reel]').forEach(function (reel) {
    var frames = $$('.reel__img', reel);
    var caption = reel.querySelector('[data-reel-caption]');
    if (reduced || frames.length < 2) return;

    var index = 0;
    var held = false;
    var visible = true;

    setInterval(function () {
      if (held || !visible || document.hidden) return;
      frames[index].classList.remove('is-active');
      index = (index + 1) % frames.length;
      frames[index].classList.add('is-active');
      if (caption) caption.textContent = frames[index].getAttribute('data-caption');
    }, 3600);

    ['mouseenter', 'focusin'].forEach(function (type) {
      reel.addEventListener(type, function () { held = true; });
    });
    ['mouseleave', 'focusout'].forEach(function (type) {
      reel.addEventListener(type, function () { held = false; });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(reel);
    }
  });


  /* Page wipe -------------------------------------------------------------- */

  function wipeColor() {
    return document.body.classList.contains('theme-dark') ? 'paper' : 'ink';
  }

  document.addEventListener('click', function (event) {
    if (reduced || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;

    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;

    event.preventDefault();
    root.setAttribute('data-wipe', wipeColor());
    root.classList.add('is-leaving');
    setTimeout(function () {
      try { sessionStorage.setItem('wipe', root.getAttribute('data-wipe')); } catch (e) {}
      location.href = url.href;
    }, 1000);
  });

  // Coming back via the back button restores the page mid-wipe; clear it.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) root.classList.remove('is-leaving', 'is-arriving', 'is-arrived');
  });


  /* Boot -------------------------------------------------------------------- */

  // Lines can only be measured once the webfont has loaded.
  var fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })])
    : Promise.resolve();

  fontsReady.then(function () {
    if (!reduced) {
      $$('[data-split]').forEach(splitLines);
      $$('[data-roll]').forEach(buildRoll);
      $$('[data-reveal-children] > *').forEach(function (el) {
        if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'fade');
      });
    }

    var arriving = root.classList.contains('is-arriving');
    if (arriving) {
      requestAnimationFrame(function () { root.classList.add('is-arrived'); });
      setTimeout(function () { root.classList.remove('is-arriving', 'is-arrived'); }, 1300);
    }

    root.classList.add('is-ready');
    // Let the panel clear the hero before its type starts to rise.
    setTimeout(observeReveals, arriving ? 350 : 60);
  });
})();
