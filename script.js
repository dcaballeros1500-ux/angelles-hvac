/* ==========================================================================
   Angelle's Affordable Air Conditioning and Heating
   Two independent pieces: the quote calculator and the booking form.
   Both are progressive enhancements -- the page is fully usable without them.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Phone number, used in the form's error message ---------------------
     Keep in sync with index.html. */
  var PHONE = '(337) 236-1738';

  /* ======================================================================
     1. Quote calculator
     Ported verbatim from the design's estimate() -- same base ranges,
     same multipliers, same rounding, same numbers on screen.
     ====================================================================== */

  var BASE = {
    repair:      [180, 620],
    maintenance: [110, 210],
    install:     [4800, 9400]
  };

  var URGENCY = { today: 1.18, week: 1.00, flexible: 0.94 };
  var AGE     = { '0-5': 0.90, '6-12': 1.00, '13-20': 1.14, '20+': 1.26 };

  var JOB_NAME = {
    repair:      'Repair or diagnosis',
    maintenance: 'Maintenance / tune-up',
    install:     'New system install'
  };

  var URGENCY_NAME = {
    today:    'Same day',
    week:     'This week',
    flexible: 'Whenever works'
  };

  var AGE_NAME = {
    '0-5':   'Under 5 years',
    '6-12':  '6–12 years',
    '13-20': '13–20 years',
    '20+':   'Over 20 years'
  };

  var NOTES = {
    repair:      'Includes the diagnostic visit. Most Lafayette repairs land in the lower half of this range — refrigerant, capacitors, and blower motors are the usual suspects.',
    maintenance: 'One system, one visit: coil clean, drain flush, refrigerant check, electrical inspection. Two-system homes are quoted per unit.',
    install:     'Full replacement of a residential system, equipment and labor. Ductwork repairs, if the old ducts are shot, are quoted separately.'
  };

  var state = { job: 'repair', urgency: 'today', age: '6-12' };

  function estimate() {
    var base = BASE[state.job];
    // A new install is priced off urgency only -- unit age is irrelevant
    // once the old system is coming out.
    var mult = state.job === 'install'
      ? URGENCY[state.urgency]
      : URGENCY[state.urgency] * AGE[state.age];

    function round(n) {
      var step = n > 2000 ? 100 : 10;
      return Math.round(n * mult / step) * step;
    }

    return [round(base[0]), round(base[1])];
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) { el.textContent = text; }
  }

  function renderEstimate() {
    var range = estimate();
    setText('est-range', money(range[0]) + ' – ' + money(range[1]));
    setText('est-note', NOTES[state.job]);
    setText('est-job', JOB_NAME[state.job]);
    setText('est-timing', URGENCY_NAME[state.urgency]);
    setText('est-age', AGE_NAME[state.age]);
  }

  function initCalculator() {
    var groups = document.querySelectorAll('[data-calc-group]');
    if (!groups.length) { return; }

    Array.prototype.forEach.call(groups, function (group) {
      var key = group.getAttribute('data-calc-group');

      group.addEventListener('click', function (event) {
        var button = event.target.closest('.opt');
        if (!button || !group.contains(button)) { return; }

        state[key] = button.getAttribute('data-value');

        Array.prototype.forEach.call(group.querySelectorAll('.opt'), function (opt) {
          opt.setAttribute('aria-pressed', String(opt === button));
        });

        renderEstimate();
      });
    });
  }

  /* ======================================================================
     2. Booking form -> Netlify

     The form works without this: no action attribute means the browser
     POSTs to the current page and Netlify serves its own confirmation.
     When fetch is available we intercept and post the identical payload
     so the visitor never leaves the page.
     ====================================================================== */

  function initBookingForm() {
    var form = document.querySelector('form[name="booking"]');
    if (!form) { return; }

    // No fetch, no FormData, no URLSearchParams -> leave the native POST alone.
    if (!window.fetch || !window.FormData || !window.URLSearchParams) { return; }

    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');

    function say(message, isError) {
      if (!status) { return; }
      status.textContent = message;
      status.classList.toggle('is-error', Boolean(isError));
    }

    form.addEventListener('submit', function (event) {
      // The browser has already run native validation by the time this fires.
      event.preventDefault();

      say('Sending…', false);
      if (submit) { submit.disabled = true; }

      fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (response) {
          if (!response.ok) { throw new Error('Netlify responded ' + response.status); }
          form.reset();
          say("Thanks — we'll call you back today.", false);
          if (submit) { submit.disabled = false; }
        })
        .catch(function () {
          if (submit) { submit.disabled = false; }
          say("That didn't send. Please call " + PHONE + " and we'll take it over the phone.", true);
        });
    });
  }

  initCalculator();
  initBookingForm();
})();
