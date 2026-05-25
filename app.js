const CONFIG = {
  // Burayı kişiselleştir:
  herName: "Aşkım",
  fromName: "Ben",
  kicker: "Bugün senin için",
  title: "Kurban Bayramın kutlu olsun",
  subtitle: "İyi ki varsın. Gülüşün hep içimi ısıtıyor.",
  message:
    "Bu bayram; sağlık, huzur, bereket ve bol kahkaha getirsin. Seni çok seviyorum.",
};

const $ = (sel) => document.querySelector(sel);
const toastEl = $("#toast");

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
}

function setText() {
  $("#kicker").textContent = CONFIG.kicker;
  $("#title").textContent = `${CONFIG.title}, ${CONFIG.herName}`;
  $("#sub").textContent = CONFIG.subtitle;
  $("#message").innerHTML = `${escapeHtml(CONFIG.message).replace(
    /Seni çok seviyorum\./g,
    '<span class="hl">Seni çok seviyorum.</span>',
  )}`;
  $("#signatureName").textContent = CONFIG.fromName;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return m;
    }
  });
}

// Lightweight confetti / hearts
const canvas = $("#fx");
const ctx = canvas.getContext("2d", { alpha: true });
let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
let w = 0;
let h = 0;

function resize() {
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize, { passive: true });
resize();

const palette = [
  "#ff4d7d",
  "#ff7aa2",
  "#ffcc66",
  "#7c4dff",
  "#30d0ff",
  "#7dffb2",
  "#ffffff",
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

function heartPath(x, y, size) {
  // Simple heart using bezier curves (relative)
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.35);
  ctx.bezierCurveTo(
    x - s * 0.5,
    y + s * 0.7,
    x,
    y + s * 0.9,
    x,
    y + s * 1.1,
  );
  ctx.bezierCurveTo(
    x,
    y + s * 0.9,
    x + s * 0.5,
    y + s * 0.7,
    x + s * 0.5,
    y + s * 0.35,
  );
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.35);
  ctx.closePath();
}

const particles = [];
let running = false;
let lastT = 0;

function spawnBurst(x, y, amount = 22) {
  const base = Math.max(10, Math.min(22, Math.round(Math.min(w, h) / 38)));
  for (let i = 0; i < amount; i++) {
    const isHeart = Math.random() < 0.45;
    particles.push({
      x,
      y,
      vx: rand(-220, 220),
      vy: rand(-360, -120),
      g: rand(520, 820),
      rot: rand(-2.5, 2.5),
      vr: rand(-7, 7),
      size: rand(base * 0.55, base * 1.25),
      color: pick(palette),
      alpha: 1,
      life: rand(0.9, 1.5),
      t: 0,
      kind: isHeart ? "heart" : "rect",
    });
  }
  if (!running) start();
}

function start() {
  running = true;
  lastT = performance.now();
  requestAnimationFrame(tick);
}

function stopIfDone() {
  if (particles.length === 0) running = false;
}

function tick(now) {
  if (!running) return;
  const dt = Math.min(0.033, (now - lastT) / 1000);
  lastT = now;

  ctx.clearRect(0, 0, w, h);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;

    const k = p.t / p.life;
    p.alpha = Math.max(0, 1 - k * k);

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;

    if (p.kind === "heart") {
      heartPath(0, 0, p.size);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size * 0.5, -p.size * 0.35, p.size, p.size * 0.7);
    }
    ctx.restore();

    if (p.t >= p.life || p.y > h + 80 || p.x < -80 || p.x > w + 80) {
      particles.splice(i, 1);
    }
  }

  stopIfDone();
  if (running) requestAnimationFrame(tick);
}

function bindUi() {
  $("#btnPlay").addEventListener("click", () => {
    const x = w * 0.5;
    const y = h * 0.35;
    spawnBurst(x, y, 44);
    showToast("Sürpriz başladı ✨");
  });

  $("#btnShare").addEventListener("click", async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: "Küçük bir sürpriz 💝",
          url,
        });
        return;
      }
    } catch {
      // ignore and fallback to clipboard
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast("Link kopyalandı");
    } catch {
      showToast("Linki kopyalayamadım");
    }
  });

  $("#chips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    const text = btn.getAttribute("data-chip");
    $("#message").innerHTML = `${escapeHtml(text)} <span class="hl">${escapeHtml(
      CONFIG.herName,
    )}</span>`;
    spawnBurst(rand(w * 0.25, w * 0.75), rand(h * 0.22, h * 0.55), 22);
  });

  const onTap = (ev) => {
    const p = ("touches" in ev && ev.touches[0]) || ev;
    spawnBurst(p.clientX, p.clientY, 18);
  };
  window.addEventListener("pointerdown", onTap, { passive: true });
}

setText();
bindUi();

