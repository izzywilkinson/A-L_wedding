/* =====================================================================
   script.js  –  shared by every page
   ---------------------------------------------------------------------
   It does four small jobs. Each one first checks whether the thing it
   controls exists on the current page, and quietly does nothing if not.
   That's why one file can be used everywhere.

     1. Door intro          (home page)
     2. Photo carousel      (home page)
     3. "See the doors again" button (home page)
     4. Highlight the current page in the bottom menu (sub-pages)
   ===================================================================== */

// Wait until the HTML has been read before looking for elements.
document.addEventListener('DOMContentLoaded', function () {

  // <html> element. We add/remove classes on it and the CSS reacts.
  // Think of these classes as light switches: JS flips the switch,
  // CSS decides what the room looks like when it's on.
  var root = document.documentElement;

  // Has the person asked their phone to reduce motion? (true / false)
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* -------------------------------------------------------------------
     1. DOOR INTRO
     Tap the doors -> add "intro-opening" to <html> -> CSS swings the
     doors open. After the animation finishes we add "intro-seen", which
     hides the intro for good.
     ------------------------------------------------------------------- */
  var intro = document.getElementById('intro');

  if (intro) {
    intro.addEventListener('click', function openDoors() {
      // Ignore extra taps while the doors are already moving.
      if (root.classList.contains('intro-opening')) return;

      root.classList.add('intro-opening');

      // Remember for this visit, so going Home from another page
      // doesn't make people open the doors again. sessionStorage is
      // forgotten when the browser tab is closed, so scanning the QR
      // code again later shows the doors again.
      // (try/catch because some private-browsing modes block storage.)
      try { sessionStorage.setItem('doorsOpened', 'yes'); } catch (e) {}

      // How long the CSS animation takes (keep in sync with style.css).
      var animationTime = reduceMotion ? 600 : 2200;

      // When it's done: hide the intro and let the page scroll.
      setTimeout(function () {
        root.classList.add('intro-seen');
        root.classList.remove('intro-opening');

        // Move keyboard focus to the main content (accessibility).
        var main = document.getElementById('main');
        if (main) main.focus({ preventScroll: true });
      }, animationTime);
    });
  }


  /* -------------------------------------------------------------------
     2. PHOTO CAROUSEL
     The swiping itself is pure CSS (scroll-snap). JavaScript only adds:
       - the dots underneath, kept in sync with the photo showing
       - auto-play every few seconds, which pauses while someone is
         touching it
     ------------------------------------------------------------------- */
  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');

  if (track && dotsWrap) {
    var slides = track.querySelectorAll('.carousel__slide');
    var dots = [];
    var current = 0;          // which photo is in the middle (0 = first)
    var pausedUntil = 0;      // time (ms) until which auto-play waits
    var AUTOPLAY_MS = 4500;   // change to make auto-play faster/slower

    // Scroll so that photo number i sits in the middle of the track.
    function goTo(i) {
      current = (i + slides.length) % slides.length;   // wrap round at the end
      var slide = slides[current];
      var left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;

      if (typeof track.scrollTo === 'function') {
        track.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
      } else {
        track.scrollLeft = left;   // very old browsers
      }
      updateDots();
    }

    // Colour in the dot that matches the current photo.
    function updateDots() {
      for (var d = 0; d < dots.length; d++) {
        dots[d].setAttribute('aria-current', d === current ? 'true' : 'false');
      }
    }

    // Build one dot button per photo.
    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + slides.length);
      // An IIFE "freezes" the value of i for each dot's click handler.
      (function (index) {
        dot.addEventListener('click', function () {
          pausedUntil = Date.now() + 10000;   // user chose a photo: pause 10s
          goTo(index);
        });
      })(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
    updateDots();

    // When the user swipes, work out which photo is now closest to the
    // middle. We wait until scrolling settles (a "debounce") instead of
    // doing the maths on every tiny scroll movement.
    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var middle = track.scrollLeft + track.clientWidth / 2;
        var closest = 0;
        var bestDistance = Infinity;
        for (var s = 0; s < slides.length; s++) {
          var slideMiddle = slides[s].offsetLeft + slides[s].offsetWidth / 2;
          var distance = Math.abs(slideMiddle - middle);
          if (distance < bestDistance) { bestDistance = distance; closest = s; }
        }
        current = closest;
        updateDots();
      }, 80);
    }, { passive: true });   // "passive" = tells the phone we won't block scrolling

    // Finger on the carousel -> pause auto-play for a while.
    function pause() { pausedUntil = Date.now() + 8000; }
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('pointerdown', pause);
    track.addEventListener('mouseenter', pause);

    // Auto-play: every few seconds move on one photo, unless
    //  - the person prefers reduced motion
    //  - the doors haven't been opened yet
    //  - they touched the carousel recently
    //  - the tab is in the background
    if (!reduceMotion && slides.length > 1) {
      setInterval(function () {
        var introDone = !document.getElementById('intro') || root.classList.contains('intro-seen');
        if (!introDone) return;
        if (Date.now() < pausedUntil) return;
        if (document.hidden) return;
        goTo(current + 1);
      }, AUTOPLAY_MS);
    }
  }


  /* -------------------------------------------------------------------
     3. "SEE THE DOORS AGAIN" button in the home page footer
     Forget that the doors were opened, scroll to the top, show them.
     ------------------------------------------------------------------- */
  var replay = document.getElementById('replayDoors');

  if (replay) {
    replay.addEventListener('click', function () {
      try { sessionStorage.removeItem('doorsOpened'); } catch (e) {}
      window.scrollTo(0, 0);
      root.classList.remove('intro-seen');
    });
  }


  /* -------------------------------------------------------------------
     4. HIGHLIGHT CURRENT PAGE in the pill menu at the bottom of
     sub-pages. Compares the file name in the address bar (e.g.
     "food.html") with each link's href.
     ------------------------------------------------------------------- */
  // .replace('.html', '') because some hosts show "/food" instead of
  // "/food.html" in the address bar – this way both match.
  var currentFile = (window.location.pathname.split('/').pop() || 'index').replace('.html', '');
  var navLinks = document.querySelectorAll('.page-nav a');

  for (var n = 0; n < navLinks.length; n++) {
    if (navLinks[n].getAttribute('href').replace('.html', '') === currentFile) {
      navLinks[n].setAttribute('aria-current', 'page');
    }
  }
});
