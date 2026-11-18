// The forks on a pair page (/self-reflection-questions/<topic>/<topic>/).
//
// Every branch is in the HTML, so the page reads in full without this
// script: each fork option is followed by where it leads. With the script,
// the branches hide until the visitor taps an option; the tapped option is
// stamped "Taken" and only its branch shows. "Try another way" clears it.
(function () {
  "use strict";

  document.querySelectorAll("[data-fork]").forEach(function (walk) {
    var buttons = walk.querySelectorAll(".fork");
    var list = walk.querySelector(".forks");
    var branches = walk.querySelectorAll(".branch");
    var wait = walk.querySelector(".wait");
    if (!buttons.length || !list) return;

    walk.classList.add("forks-live");
    walk.querySelectorAll(".hint").forEach(function (h) {
      h.hidden = false;
    });

    function show(id) {
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.branch === id));
      });
      list.classList.toggle("forks--picked", id !== null);
      branches.forEach(function (br) {
        br.hidden = br.id !== id;
      });
      if (wait) wait.hidden = id !== null;
    }

    buttons.forEach(function (b) {
      b.disabled = false;
      b.addEventListener("click", function () {
        var picked = b.getAttribute("aria-pressed") === "true";
        show(picked ? null : b.dataset.branch);
        if (!picked) {
          var target = document.getElementById(b.dataset.branch);
          if (target && target.getBoundingClientRect().top > window.innerHeight) {
            target.scrollIntoView({ block: "nearest" });
          }
        }
      });
    });
    walk.querySelectorAll("[data-fork-reset]").forEach(function (r) {
      r.hidden = false;
      r.addEventListener("click", function () {
        show(null);
        buttons[0].focus();
      });
    });

    show(null);
  });
})();
