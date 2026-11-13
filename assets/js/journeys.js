/*
  Journeys: the three looping phone videos on the landing page.

  What this does, and nothing more:
  - plays a journey's video only while it is on screen, and pauses it off screen;
  - never starts a video on its own when the visitor asks for reduced motion;
  - shows the Pause / Play button (WCAG 2.2.2: motion longer than 5 seconds);
  - marks the step beside the phone that is on screen, from the video's own clock.

  Without this script each journey shows its poster (the loop's first frame)
  and all three steps at full strength. No network requests, no storage.

  Markup it expects (see index.html):
    <section class="journey" data-journey>
      <ol class="journey__steps"> <li>…</li> <li>…</li> <li>…</li> </ol>
      <button class="journey__toggle" hidden>Pause</button>
      <video data-beats="0 3.15 13.35"> … </video>
    </section>
  data-beats lists, in seconds into the loop, when each step starts.
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function play(video) {
    var started = video.play();
    if (started && typeof started.catch === "function") {
      // Autoplay can be refused (for example iOS Low Power Mode). The poster stays.
      started.catch(function () {});
    }
  }

  document.querySelectorAll("[data-journey]").forEach(function (journey) {
    var video = journey.querySelector("video");
    var steps = journey.querySelectorAll(".journey__steps li");
    var list = journey.querySelector(".journey__steps");
    var toggle = journey.querySelector(".journey__toggle");
    if (!video) return;

    var beats = (video.getAttribute("data-beats") || "0")
      .trim().split(/\s+/).map(Number);

    // Paused by the visitor (or by reduced motion) until they press Play.
    var heldByVisitor = reduceMotion;
    var onScreen = false;

    function markStep() {
      var t = video.currentTime;
      var current = 0;
      for (var i = 0; i < beats.length; i++) {
        if (t >= beats[i]) current = i;
      }
      steps.forEach(function (step, i) {
        step.classList.toggle("is-current", i === current);
      });
    }

    function labelToggle() {
      if (!toggle) return;
      toggle.textContent = heldByVisitor ? "Play" : "Pause";
      toggle.setAttribute("aria-pressed", heldByVisitor ? "true" : "false");
    }

    if (list) list.classList.add("is-synced");
    markStep();
    video.addEventListener("timeupdate", markStep);

    if (toggle) {
      toggle.hidden = false;
      labelToggle();
      toggle.addEventListener("click", function () {
        heldByVisitor = !heldByVisitor;
        labelToggle();
        if (heldByVisitor) video.pause();
        else play(video);
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          onScreen = entry.isIntersecting;
          if (onScreen && !heldByVisitor) play(video);
          if (!onScreen) video.pause();
        });
      }, { threshold: 0.35 }).observe(video);
    } else if (!heldByVisitor) {
      play(video);
    }
  });
})();
