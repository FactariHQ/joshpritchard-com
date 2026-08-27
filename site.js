(function () {
  "use strict";

  /* ---------------------------------------------------------- theme --- */
  var root = document.documentElement;
  var KEY = "jp-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
  }

  var saved = stored();
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function currentIsDark() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function labelFor(btn) {
    var dark = currentIsDark();
    btn.textContent = dark ? "Light" : "Dark";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  var toggles = document.querySelectorAll("[data-theme-toggle]");
  Array.prototype.forEach.call(toggles, function (btn) {
    labelFor(btn);
    btn.addEventListener("click", function () {
      var next = currentIsDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      Array.prototype.forEach.call(toggles, labelFor);
    });
  });

  /* ------------------------------------------- cumulative record draw --- */
  var records = document.querySelectorAll("[data-record]");
  Array.prototype.forEach.call(records, function (rec) {
    var line = rec.querySelector(".rec-line--anim");
    if (line && line.getTotalLength) {
      var len = Math.ceil(line.getTotalLength());
      line.style.setProperty("--len", len);
    }
  });

  /* ------------------------------------------------- contact form ----- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var sent = document.querySelector("[data-form-sent]");
    var errEl = form.querySelector("[data-form-error]");
    var btn = form.querySelector("[data-submit]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errEl) errEl.hidden = true;
      if (btn) { btn.disabled = true; btn.textContent = "Sending\u2026"; }
      var fd = new FormData(form);
      var body = new URLSearchParams();
      fd.forEach(function (v, k) { body.append(k, v); });
      fetch(form.getAttribute("data-endpoint"), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: body.toString()
      }).then(function () {
        form.hidden = true;
        if (sent) { sent.hidden = false; sent.scrollIntoView({ block: "center" }); }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Send it"; }
        if (errEl) errEl.hidden = false;
      });
    });
  }

  /* ----------------------------------------------- reveal on scroll ---- */
  var revs = document.querySelectorAll(".rev, [data-record]");
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revs, function (el) {
      el.classList.add("is-in");
      if (el.hasAttribute("data-record")) el.classList.add("rec-drawn");
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.hasAttribute("data-record")) e.target.classList.add("rec-drawn");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
})();
