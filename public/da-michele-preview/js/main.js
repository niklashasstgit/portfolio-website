// Da Michele preview – shared behaviour

(function () {
  "use strict";

  // Mobile navigation toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Reveal-on-scroll
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealed.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealed.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // Menu category scroll-spy (Speisekarte / Mittagstisch)
  var pills = document.querySelectorAll(".menu-nav a[data-target]");
  if (pills.length) {
    var sections = [];
    pills.forEach(function (pill) {
      var section = document.getElementById(pill.getAttribute("data-target"));
      if (section) sections.push({ pill: pill, section: section });
    });

    var setActive = function (id) {
      pills.forEach(function (pill) {
        pill.classList.toggle("active", pill.getAttribute("data-target") === id);
      });
    };

    var spy = function () {
      var offset = window.scrollY + 190;
      var current = sections.length ? sections[0].section.id : null;
      sections.forEach(function (entry) {
        if (entry.section.offsetTop <= offset) current = entry.section.id;
      });
      if (current) setActive(current);
    };

    window.addEventListener("scroll", spy, { passive: true });
    spy();

    // Smooth scroll that also keeps the pill bar in view on mobile
    pills.forEach(function (pill) {
      pill.addEventListener("click", function (e) {
        var section = document.getElementById(pill.getAttribute("data-target"));
        if (!section) return;
        e.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(section.id);
        pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });
  }

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
