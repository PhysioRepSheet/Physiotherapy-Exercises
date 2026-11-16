/*
  "Send feedback" and "Request an exercise" links.
  Where they go is set in config.js.
*/
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  const NO_PATIENT = "Please don't include any patient details.";

  const templates = {
    feedback: {
      form: cfg.feedbackFormUrl,
      subject: "Exercise Handout Builder: feedback",
      body: [
        NO_PATIENT, "",
        "Your role (e.g. Band 6 MSK physio):", "",
        "What worked well:", "",
        "What could be better:", "",
        "Anything else:", ""
      ]
    },
    exercise: {
      form: cfg.exerciseRequestFormUrl,
      subject: "Exercise Handout Builder: exercise request",
      body: [
        NO_PATIENT, "",
        "Exercise name:", "",
        "Body area:", "",
        "How to do it (steps for the patient):", "",
        "Suggested sets / reps / hold:", "",
        "Suggested progressions (harder):", "",
        "Suggested regressions (easier):", "",
        "Your name and role (optional):", ""
      ]
    }
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-request]");
    if (!link) return;
    e.preventDefault();
    const t = templates[link.dataset.request];
    if (!t) return;
    if (t.form) { window.open(t.form, "_blank", "noopener"); return; }
    window.location.href = "mailto:" + encodeURIComponent(cfg.contactEmail || "") +
      "?subject=" + encodeURIComponent(t.subject) +
      "&body=" + encodeURIComponent(t.body.join("\n"));
  });
})();
