/* =========================================================
   Rudransh Singh — portfolio behaviour
   Vanilla JS, no dependencies
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $all(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  /* ---------------------------------------------------------
     Theme
     --------------------------------------------------------- */

  var themeToggle = $("#theme-toggle");

  function themeIsDark() {
    return root.getAttribute("data-theme") === "dark";
  }

  function syncThemeButton() {
    if (!themeToggle) return;
    var dark = themeIsDark();
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.setAttribute("title", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem("rs-theme", theme);
      } catch (error) {
        /* storage can be unavailable — theme still applies */
      }
    }
    syncThemeButton();
    document.dispatchEvent(new CustomEvent("rs:themechange", { detail: { theme: theme } }));
  }

  syncThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(themeIsDark() ? "light" : "dark", true);
    });
  }

  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  function followSystemTheme(event) {
    var saved = null;
    try {
      saved = localStorage.getItem("rs-theme");
    } catch (error) {
      saved = null;
    }
    if (saved !== "light" && saved !== "dark") {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  }
  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", followSystemTheme);
  } else if (systemTheme.addListener) {
    systemTheme.addListener(followSystemTheme);
  }

  /* ---------------------------------------------------------
     Header, progress bar, active section
     --------------------------------------------------------- */

  var header = $("#site-header");
  var progressBar = $("#progress-bar");
  var navLinks = $all(".nav a");
  var pageSections = navLinks
    .map(function (link) {
      var target = link.getAttribute("href");
      return target && target.charAt(0) === "#" ? document.getElementById(target.slice(1)) : null;
    })
    .filter(Boolean);

  var scrollQueued = false;

  function updateOnScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
    }

    if (progressBar) {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1) : 0;
      progressBar.style.transform = "scaleX(" + progress + ")";
    }

    if (pageSections.length) {
      var current = "";
      for (var i = 0; i < pageSections.length; i += 1) {
        if (pageSections[i].getBoundingClientRect().top <= 150) {
          current = pageSections[i].id;
        }
      }
      navLinks.forEach(function (link) {
        if (current && link.getAttribute("href") === "#" + current) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    scrollQueued = false;
  }

  function requestScrollUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateOnScroll);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateOnScroll();

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */

  var menuButton = $("#menu-btn");
  var mobileMenu = $("#mobile-menu");

  function menuIsOpen() {
    return root.classList.contains("menu-open");
  }

  function openMenu() {
    if (!mobileMenu || !menuButton) return;
    root.classList.add("menu-open");
    mobileMenu.removeAttribute("inert");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    window.setTimeout(function () {
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus({ preventScroll: true });
    }, 80);
  }

  function closeMenu(returnFocus) {
    if (!mobileMenu || !menuButton) return;
    root.classList.remove("menu-open");
    mobileMenu.setAttribute("inert", "");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    if (returnFocus) {
      menuButton.focus({ preventScroll: true });
    }
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      if (menuIsOpen()) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    $all("a", mobileMenu).forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!menuIsOpen()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      var focusables = [menuButton].concat($all("a", mobileMenu));
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 981px)");
    function closeOnDesktop(event) {
      if (event.matches && menuIsOpen()) closeMenu(false);
    }
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", closeOnDesktop);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(closeOnDesktop);
    }
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */

  var revealItems = $all(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     Copy email + toast
     --------------------------------------------------------- */

  var copyButton = $("#copy-email");
  var toast = $("#toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function copyTextFallback(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-email") || "";
      if (!email) return;

      function markCopied() {
        copyButton.classList.add("is-copied");
        copyButton.setAttribute("aria-label", "Email copied");
        showToast("Email copied to clipboard");
        window.setTimeout(function () {
          copyButton.classList.remove("is-copied");
          copyButton.setAttribute("aria-label", "Copy email address");
        }, 2200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(markCopied, function () {
          if (copyTextFallback(email)) markCopied();
          else showToast("Copy failed — email is " + email);
        });
      } else if (copyTextFallback(email)) {
        markCopied();
      } else {
        showToast("Copy failed — email is " + email);
      }
    });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */

  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     Smooth Snake — a small playable homage
     --------------------------------------------------------- */

  var board = $("#game-board");
  var canvas = $("#snake-canvas");

  if (board && canvas) {
    var context = canvas.getContext("2d");
    var scoreLabel = $("#game-score");
    var bestLabel = $("#game-best");
    var panel = $("#game-overlay");
    var panelLabel = $("#game-overline");
    var panelTitle = $("#game-title");
    var panelMessage = $("#game-message");
    var startButton = $("#game-start");
    var pauseButton = $("#game-pause");
    var resetButton = $("#game-reset");
    var pauseText = pauseButton ? pauseButton.querySelector("span") : null;
    var directionButtons = $all(".dpad__btn");
    var storageKey = "rs-snake-best";

    var COLS = 20;
    var ROWS = 20;
    var BASE_TICK = 142;
    var MIN_TICK = 88;
    var state = "idle";
    var snake = [];
    var previousSnake = [];
    var direction = { x: 1, y: 0 };
    var directionQueue = [];
    var food = null;
    var score = 0;
    var tickMs = BASE_TICK;
    var accumulator = 0;
    var interpolation = 0;
    var lastFrameTime = 0;
    var boardSize = 480;
    var boardInView = true;
    var colors = {};

    function readBest() {
      try {
        var stored = parseInt(localStorage.getItem(storageKey), 10);
        return isFinite(stored) && stored > 0 ? stored : 0;
      } catch (error) {
        return 0;
      }
    }

    var best = readBest();

    function readColors() {
      var styles = getComputedStyle(root);
      colors = {
        ink: styles.getPropertyValue("--ink").trim() || "#171411",
        accent: styles.getPropertyValue("--accent").trim() || "#8a5a2c",
        tan: styles.getPropertyValue("--tan").trim() || "#c9a97d",
        line: styles.getPropertyValue("--line").trim() || "#ded3c3"
      };
    }

    readColors();
    document.addEventListener("rs:themechange", readColors);

    function setScores() {
      if (scoreLabel) scoreLabel.textContent = String(score);
      if (bestLabel) bestLabel.textContent = String(best);
    }

    function persistBest() {
      try {
        localStorage.setItem(storageKey, String(best));
      } catch (error) {
        /* best score just won't persist */
      }
    }

    function setPauseLabel(label) {
      if (pauseText) pauseText.textContent = label;
      if (pauseButton) pauseButton.setAttribute("aria-label", label === "Pause" ? "Pause game" : "Resume game");
    }

    function copySnake() {
      return snake.map(function (segment) {
        return { x: segment.x, y: segment.y };
      });
    }

    function placeFood() {
      var free = [];
      for (var y = 0; y < ROWS; y += 1) {
        for (var x = 0; x < COLS; x += 1) {
          var occupied = snake.some(function (segment) {
            return segment.x === x && segment.y === y;
          });
          if (!occupied) free.push({ x: x, y: y });
        }
      }
      food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
    }

    function resetSnake() {
      snake = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      previousSnake = copySnake();
      direction = { x: 1, y: 0 };
      directionQueue = [];
      score = 0;
      tickMs = BASE_TICK;
      accumulator = 0;
      interpolation = 0;
      placeFood();
      setScores();
    }

    resetSnake();

    function showOverlay(label, title, message, buttonText) {
      if (!panel) return;
      if (panelLabel) panelLabel.textContent = label;
      if (panelTitle) panelTitle.textContent = title;
      if (panelMessage) panelMessage.textContent = message;
      if (startButton) startButton.textContent = buttonText;
      panel.hidden = false;
    }

    function hideOverlay() {
      if (panel) panel.hidden = true;
    }

    function startGame() {
      resetSnake();
      state = "playing";
      hideOverlay();
      setPauseLabel("Pause");
      lastFrameTime = performance.now();
      board.setAttribute(
        "aria-label",
        "Smooth Snake game in progress. Use arrow keys or W A S D to steer, space to pause, R to restart."
      );
      board.focus({ preventScroll: true });
    }

    function pauseGame() {
      if (state !== "playing") return;
      state = "paused";
      setPauseLabel("Resume");
      showOverlay("Paused", "Take a breath.", "Your run is safe. Resume whenever you are ready.", "Resume");
      board.setAttribute("aria-label", "Smooth Snake game paused. Press space or Resume to continue.");
    }

    function resumeGame() {
      if (state !== "paused") return;
      state = "playing";
      hideOverlay();
      setPauseLabel("Pause");
      lastFrameTime = performance.now();
      accumulator = 0;
      board.focus({ preventScroll: true });
    }

    function endGame() {
      state = "over";
      if (score > best) {
        best = score;
        persistBest();
      }
      setScores();
      setPauseLabel("Pause");
      showOverlay(
        "Game over",
        score > 0 ? "Nice run — " + score : "Tough start.",
        score > 0 ? "Best score: " + best + ". Want another go?" : "The first run is always the hardest. Try again?",
        "Play again"
      );
      board.setAttribute(
        "aria-label",
        "Smooth Snake game over. Score " + score + ". Best " + best + ". Press restart or Play again."
      );
      if (startButton) startButton.focus({ preventScroll: true });
    }

    function queueDirection(next) {
      if (!next) return;
      if (state === "idle" || state === "over") {
        startGame();
      }
      if (state === "paused") resumeGame();
      if (state !== "playing") return;

      var base = directionQueue.length ? directionQueue[directionQueue.length - 1] : direction;
      var isReverse = next.x === -base.x && next.y === -base.y;
      var isSame = next.x === base.x && next.y === base.y;
      if (!isReverse && !isSame && directionQueue.length < 2) {
        directionQueue.push(next);
      }
    }

    function step() {
      previousSnake = copySnake();

      if (directionQueue.length) {
        var next = directionQueue.shift();
        if (!(next.x === -direction.x && next.y === -direction.y)) {
          direction = next;
        }
      }

      var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      var willEat = food && head.x === food.x && head.y === food.y;
      var body = willEat ? snake : snake.slice(0, -1);
      var hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
      var hitSelf = body.some(function (segment) {
        return segment.x === head.x && segment.y === head.y;
      });

      if (hitWall || hitSelf) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (willEat) {
        score += 1;
        tickMs = Math.max(MIN_TICK, BASE_TICK - score * 4);
        placeFood();
        setScores();
      } else {
        snake.pop();
      }

      interpolation = 0;
    }

    function roundRect(target, x, y, width, height, radius) {
      var r = Math.min(radius, width / 2, height / 2);
      target.beginPath();
      target.moveTo(x + r, y);
      target.arcTo(x + width, y, x + width, y + height, r);
      target.arcTo(x + width, y + height, x, y + height, r);
      target.arcTo(x, y + height, x, y, r);
      target.arcTo(x, y, x + width, y, r);
      target.closePath();
    }

    function segmentPosition(index) {
      var current = snake[index];
      var previous = previousSnake[Math.min(index, previousSnake.length - 1)] || current;
      return {
        x: previous.x + (current.x - previous.x) * interpolation,
        y: previous.y + (current.y - previous.y) * interpolation
      };
    }

    function draw(time) {
      if (!context || !boardSize) return;

      var size = boardSize;
      var cell = size / COLS;
      context.clearRect(0, 0, size, size);

      /* faint dot grid */
      context.fillStyle = colors.line;
      context.globalAlpha = 0.45;
      for (var row = 0; row < ROWS; row += 1) {
        for (var col = 0; col < COLS; col += 1) {
          context.beginPath();
          context.arc((col + 0.5) * cell, (row + 0.5) * cell, Math.max(0.6, cell * 0.028), 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;

      /* food */
      if (food) {
        var pulse = reduceMotion.matches ? 0 : (Math.sin(time / 380) + 1) / 2;
        var foodX = (food.x + 0.5) * cell;
        var foodY = (food.y + 0.5) * cell;

        context.save();
        context.shadowColor = colors.accent;
        context.shadowBlur = 10 + pulse * 9;
        context.fillStyle = colors.accent;
        context.beginPath();
        context.arc(foodX, foodY, cell * 0.25, 0, Math.PI * 2);
        context.fill();
        context.restore();

        context.strokeStyle = colors.tan;
        context.globalAlpha = 0.5;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(foodX, foodY, cell * (0.36 + pulse * 0.05), 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 1;
      }

      /* snake, tail first so the head sits on top */
      for (var i = snake.length - 1; i >= 0; i -= 1) {
        var position = segmentPosition(i);
        var inset = cell * 0.08;
        var alpha = 0.3 + 0.7 * (1 - i / snake.length);
        context.globalAlpha = i === 0 ? 1 : Math.max(0.35, alpha);
        context.fillStyle = i === 0 ? colors.accent : colors.ink;
        roundRect(
          context,
          position.x * cell + inset,
          position.y * cell + inset,
          cell - inset * 2,
          cell - inset * 2,
          cell * 0.3
        );
        context.fill();
      }
      context.globalAlpha = 1;

      /* eyes on the head, oriented with travel */
      if (snake.length) {
        var head = segmentPosition(0);
        var headX = (head.x + 0.5) * cell;
        var headY = (head.y + 0.5) * cell;
        var forwardX = direction.x * cell * 0.17;
        var forwardY = direction.y * cell * 0.17;
        var sideX = -direction.y * cell * 0.16;
        var sideY = direction.x * cell * 0.16;
        var eyeRadius = Math.max(1, cell * 0.065);

        context.fillStyle = "#171411";
        [1, -1].forEach(function (side) {
          context.beginPath();
          context.arc(headX + forwardX + sideX * side, headY + forwardY + sideY * side, eyeRadius, 0, Math.PI * 2);
          context.fill();
        });
      }
    }

    function resizeCanvas() {
      if (!canvas || !context) return;
      var rect = board.getBoundingClientRect();
      var cssSize = Math.min(rect.width, rect.height);
      if (!cssSize) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pixelSize = Math.round(cssSize * dpr);
      if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
        canvas.width = pixelSize;
        canvas.height = pixelSize;
      }
      boardSize = cssSize;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function animate(time) {
      if (!lastFrameTime) lastFrameTime = time;
      var delta = Math.min(time - lastFrameTime, 120);
      lastFrameTime = time;

      if (state === "playing") {
        accumulator += delta;
        var guard = 0;
        while (accumulator >= tickMs && guard < 5) {
          accumulator -= tickMs;
          step();
          guard += 1;
          if (state !== "playing") break;
        }
        if (state === "playing") {
          interpolation = Math.min(accumulator / tickMs, 1);
        }
      }

      draw(time);
      window.requestAnimationFrame(animate);
    }

    var directionMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 }
    };

    document.addEventListener("keydown", function (event) {
      if (!boardInView) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      var key = event.key;
      var mapped = directionMap[key] || directionMap[key.toLowerCase()];

      if (key === " " || key === "Spacebar") {
        if (state === "playing" || state === "paused") {
          event.preventDefault();
          if (state === "playing") pauseGame();
          else resumeGame();
        }
        return;
      }

      if (key === "r" || key === "R") {
        if (state !== "idle") {
          event.preventDefault();
          startGame();
        }
        return;
      }

      if (mapped && state === "playing") {
        event.preventDefault();
        queueDirection(mapped);
      }
    });

    if (startButton) {
      startButton.addEventListener("click", function () {
        if (state === "paused") resumeGame();
        else startGame();
      });
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", function () {
        if (state === "playing") pauseGame();
        else if (state === "paused") resumeGame();
        else startGame();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", startGame);
    }

    directionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var map = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 }
        };
        queueDirection(map[button.getAttribute("data-dir")]);
      });
    });

    var swipeStart = null;

    board.addEventListener(
      "pointerdown",
      function (event) {
        if (event.pointerType === "mouse") return;
        swipeStart = { x: event.clientX, y: event.clientY };
      },
      { passive: true }
    );

    board.addEventListener(
      "pointerup",
      function (event) {
        if (!swipeStart) return;
        var dx = event.clientX - swipeStart.x;
        var dy = event.clientY - swipeStart.y;
        swipeStart = null;
        if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;

        if (Math.abs(dx) > Math.abs(dy)) {
          queueDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
        } else {
          queueDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
        }
      },
      { passive: true }
    );

    board.addEventListener("pointercancel", function () {
      swipeStart = null;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state === "playing") pauseGame();
    });

    if ("IntersectionObserver" in window) {
      var boardObserver = new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          boardInView = entry.isIntersecting;
          if (!boardInView && state === "playing") pauseGame();
        },
        { threshold: 0.3 }
      );
      boardObserver.observe(board);
    }

    if ("ResizeObserver" in window) {
      var boardResizeObserver = new ResizeObserver(resizeCanvas);
      boardResizeObserver.observe(board);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    setScores();
    resizeCanvas();
    window.requestAnimationFrame(animate);
  }
})();
