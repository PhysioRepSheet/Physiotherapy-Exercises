/* TUTORIAL PAGE: highlights the section you are reading in the contents list. Nothing is saved. */
(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;
  var links = {};
  document.querySelectorAll(".tut-toc a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var current = null;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (current) current.removeAttribute("aria-current");
      current = links[e.target.id];
      if (current) current.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll(".tut-body > section[id]").forEach(function (s) { io.observe(s); });
})();
