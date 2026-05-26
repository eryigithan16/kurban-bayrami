const CONFIG = {
  // Burayı kişiselleştir:
  herName: "Melikemm",
  fromName: "Canikon",
  title: "Kurban Bayramın kutlu olsun",
  subtitle: "Birlikte nice ve birlikte de geçireceğimiz bayramlara <3",
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

// Audio (moo)
let mooAudio = null;
let audioUnlocked = false;
let mooTimer = null;
let mooLoopStarted = false;
let lastMooAt = 0;

function initMooAudio() {
  if (mooAudio) return mooAudio;
  mooAudio = new Audio();
  mooAudio.preload = "auto";
  mooAudio.volume = 0.28;
  // Tercih sırası: mp3, sonra ogg
  mooAudio.src = "assets/moo.mp3";
  mooAudio.addEventListener("error", () => {
    // fallback
    mooAudio.src = "assets/moo.ogg";
  });
  return mooAudio;
}

async function unlockAudioOnce() {
  if (audioUnlocked) return;
  const a = initMooAudio();
  try {
    // iOS/Safari: ilk etkileşimde kısa bir play/pause ile unlock
    await a.play();
    a.pause();
    a.currentTime = 0;
    audioUnlocked = true;
  } catch {
    // Kullanıcı ayarları/OS kısıtları nedeniyle unlock olmayabilir; sessizce geç
  }
}

async function playMoo() {
  const now = Date.now();
  if (now - lastMooAt < 900) return; // spam önle
  lastMooAt = now;
  const a = initMooAudio();
  try {
    a.currentTime = 0;
    await a.play();
    setBubble("mööö 🐮");
  } catch {
    // sessizce geç
  }
}

function scheduleRandomMoo() {
  clearTimeout(mooTimer);
  // 4–9 saniye arası rastgele (daha sık/çabuk)
  const delay = Math.floor(rand(4_000, 9_000));
  mooTimer = setTimeout(async () => {
    await playMoo();
    scheduleRandomMoo();
  }, delay);
}

function setText() {
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

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Lightweight confetti / hearts
// (kaldırıldı) tıklama/kalp animasyonu performans için kapatıldı

function setBubble(text) {
  const el = $("#bubble");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function bindUi() {
  const onFirstTap = () => {
    unlockAudioOnce().then(() => {
      if (!audioUnlocked) return;
      if (mooLoopStarted) return;
      mooLoopStarted = true;
      setTimeout(() => void playMoo(), 80);
      scheduleRandomMoo();
    });
    window.removeEventListener("pointerdown", onFirstTap);
  };
  window.addEventListener("pointerdown", onFirstTap, { passive: true });

  const cow = document.querySelector(".cow");
  if (cow) {
    cow.addEventListener(
      "click",
      () => {
        setBubble("möö 🐮💗");
        void playMoo();
      },
      { passive: true },
    );
  }
}

setText();
bindUi();
