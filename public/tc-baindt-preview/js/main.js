// TC Baindt — Interaktionen: Navigation, Lightbox, Karte
(function () {
  "use strict";

  // Mobile-Navigation
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  // Header-Schatten beim Scrollen
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Lightbox für alle zoombaren Bilder
  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Schließen">&times;</button><img alt="">';
  document.body.appendChild(lightbox);
  var lightboxImg = lightbox.querySelector("img");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }
  lightbox.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  document.querySelectorAll("[data-zoom]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (!img) return;
      openLightbox(el.getAttribute("data-zoom-src") || img.src, img.alt);
    });
  });

  // Karte erst nach Klick laden (Datenschutz)
  var mapBtn = document.querySelector("[data-load-map]");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var wrap = mapBtn.closest(".map-embed");
      var iframe = document.createElement("iframe");
      iframe.src =
        "https://www.google.com/maps?q=Tennisclub%20Baindt%2C%20Friesenh%C3%A4usler%20Stra%C3%9Fe%2030%2C%2088255%20Baindt&output=embed";
      iframe.title = "Anfahrt zur Tennisanlage des TC Baindt";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      wrap.innerHTML = "";
      wrap.appendChild(iframe);
    });
  }
})();
