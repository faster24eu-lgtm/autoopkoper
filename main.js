// Auto Opkoper - two-step car form, photo preview, call/WhatsApp click events.
(function () {
  var form = document.getElementById("bod");
  if (!form) return;

  var plate = document.getElementById("nummerplaat");
  var km = document.getElementById("kilometerstand");
  var step2 = document.getElementById("step2");
  var staat = document.getElementById("staat");
  var fotos = document.getElementById("fotos");
  var thumbs = document.getElementById("thumbs");
  var MAX_FOTOS = 4;
  var MAX_BYTES = 5 * 1024 * 1024; // FormSubmit attachment limit

  function fieldOf(el) { return el.closest(".field"); }
  function setInvalid(el, bad) { fieldOf(el).classList.toggle("invalid", bad); return !bad; }

  // Belgian plates: 1-ABC-123 (since 2010), older ABC-123 / 123-ABC. Accept with or without dashes.
  function normPlate(v) {
    var raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    var m = raw.match(/^([1-9])([A-Z]{3})(\d{3})$/);
    if (m) return m[1] + "-" + m[2] + "-" + m[3];
    m = raw.match(/^([A-Z]{3})(\d{3})$/) || raw.match(/^(\d{3})([A-Z]{3})$/);
    if (m) return m[1] + "-" + m[2];
    return null;
  }
  plate.addEventListener("input", function () {
    plate.value = plate.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (fieldOf(plate).classList.contains("invalid") && normPlate(plate.value)) setInvalid(plate, false);
  });
  plate.addEventListener("blur", function () {
    var n = normPlate(plate.value);
    if (n) plate.value = n;
  });

  function kmDigits() { return km.value.replace(/\D/g, ""); }
  km.addEventListener("input", function () {
    var d = kmDigits().slice(0, 7);
    km.value = d ? Number(d).toLocaleString("nl-BE") : "";
    if (d) setInvalid(km, false);
  });

  function validStep1() {
    var n = normPlate(plate.value);
    if (n) plate.value = n;
    var ok1 = setInvalid(plate, !n);
    var ok2 = setInvalid(km, !kmDigits());
    if (!ok1) plate.focus(); else if (!ok2) km.focus();
    return ok1 && ok2;
  }

  function showStep(n) {
    var two = n === 2;
    form.classList.toggle("at-step2", two);
    if (two) {
      document.getElementById("sum-plate").textContent = plate.value;
      document.getElementById("sum-km").textContent = km.value;
      if (typeof gtag === "function") gtag("event", "form_step1_complete");
      document.getElementById("merkmodel").focus({ preventScroll: true });
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      plate.focus();
    }
  }

  document.getElementById("to-step2").addEventListener("click", function () {
    if (validStep1()) showStep(2);
  });
  document.getElementById("back-step1").addEventListener("click", function () { showStep(1); });
  [plate, km].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (el === plate) km.focus(); else if (validStep1()) showStep(2);
    });
  });

  // Step 2 checks
  var checks = {
    merkmodel: function (v) { return v.trim().length >= 2; },
    bouwjaar: function (v) { var y = +v; return /^\d{4}$/.test(v) && y >= 1950 && y <= new Date().getFullYear() + 1; },
    postcode: function (v) { return /^[1-9]\d{3}$/.test(v); },
    staat: function (v) { return !!v; },
    gsm: function (v) { var d = v.replace(/[^\d+]/g, ""); return /^(\+32|0032|0)4\d{8}$/.test(d) || /^(\+|00)\d{9,14}$/.test(d); },
    email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  };
  Object.keys(checks).forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener(el.tagName === "SELECT" ? "change" : "blur", function () {
      if (el.value) setInvalid(el, !checks[id](el.value));
    });
  });

  // Photos: max 4, preview thumbnails
  fotos.addEventListener("change", function () {
    thumbs.innerHTML = "";
    var files = Array.prototype.slice.call(fotos.files || []);
    var total = files.reduce(function (s, f) { return s + f.size; }, 0);
    var bad = files.length > MAX_FOTOS || total > MAX_BYTES;
    fieldOf(fotos).classList.toggle("invalid", bad);
    files.slice(0, MAX_FOTOS).forEach(function (f) {
      var img = document.createElement("img");
      img.alt = "";
      img.src = URL.createObjectURL(f);
      thumbs.appendChild(img);
    });
  });

  form.addEventListener("submit", function (e) {
    if (!form.classList.contains("at-step2")) {
      e.preventDefault();
      if (validStep1()) showStep(2);
      return;
    }
    var firstBad = null;
    Object.keys(checks).forEach(function (id) {
      var el = document.getElementById(id);
      var ok = setInvalid(el, !checks[id](el.value));
      if (!ok && !firstBad) firstBad = el;
    });
    if (fieldOf(fotos).classList.contains("invalid") && !firstBad) firstBad = fotos;
    if (firstBad) { e.preventDefault(); firstBad.focus(); return; }
    var btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.textContent = "Bezig met versturen…";
  });

  // Every "back to the form" button: scroll up, preselect the condition from a tile, focus the plate.
  document.querySelectorAll("[data-goto-form]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (a.dataset.staat) staat.value = a.dataset.staat;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        (form.classList.contains("at-step2") ? document.getElementById("merkmodel") : plate).focus({ preventScroll: true });
      }, 450);
    });
  });
})();

// Call / WhatsApp click events (add a conversion label here later if wanted)
document.querySelectorAll("[data-track]").forEach(function (a) {
  a.addEventListener("click", function () {
    if (typeof gtag === "function") gtag("event", a.dataset.track === "call" ? "click_call" : "click_whatsapp");
  });
});

var y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
