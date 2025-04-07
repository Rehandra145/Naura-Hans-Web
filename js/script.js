lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section.snap-start");
  let currentSectionIndex = 0;
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      currentSectionIndex = Math.min(
        currentSectionIndex + 1,
        sections.length - 1
      );
      sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
      sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });
    }
  });

  let timeout;
  window.addEventListener("scroll", function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          currentSectionIndex = i;
          break;
        }
      }
    }, 50);
  });

  const overlay = document.getElementById("welcomeOverlay");
  const openButton = document.getElementById("openInvitation");
  const welcomeNameElement = document.getElementById("welcomeName");
  const params = new URLSearchParams(window.location.search);
  const nama = params.get("nama") || "Tamu Terhormat";
  const teman = params.get("teman");
  const keluarga = params.get("keluarga");
  let tambahan = [];
  if (params.has("teman")) {
    tambahan.push(
      teman == "0"
        ? "& Teman"
        : ` & ${teman.charAt(0).toUpperCase() + teman.slice(1)}`
    );
  }
  if (params.has("keluarga")) {
    tambahan.push(
      keluarga == "0"
        ? "& Keluarga"
        : ` & ${keluarga.charAt(0).toUpperCase() + keluarga.slice(1)}`
    );
  }
  welcomeNameElement.textContent =
    nama.charAt(0).toUpperCase() + nama.slice(1) + (tambahan.length > 0 ? " " + tambahan.join(" & ") : "");
  document.body.style.overflow = "hidden";
  playAudio();
  setupAudioResilience();
  openButton.addEventListener("click", function () {
    overlay.classList.add("animate-fadeOut");
    setTimeout(() => {
      overlay.style.display = "none";
      playAudio();
    }, 500);
    document.body.style.overflow = "auto";
  });
});
function setupAudioResilience() {
  audio.addEventListener("pause", () => {
    if (!userPaused) {
      setTimeout(() => tryPlayAudio("pause event"), 300);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !userPaused && audio.paused) {
      tryPlayAudio("visibility change");
    }
  });
  audio.addEventListener("canplaythrough", () => {
    if (!userPaused && audio.paused) {
      tryPlayAudio("canplaythrough");
    }
  });
  setInterval(() => {
    if (!userPaused && audio.paused && Date.now() - lastAttempt > 10000) {
      audio.load();
      tryPlayAudio("interval recovery");
      lastAttempt = Date.now();
    }
  }, 5000);
}
function playAudio() {
  if (userPaused) return;
  audio
    .play()
    .then(() => {
      musicIcon.src = "./assets/sound.png";
    })
    .catch((error) => {
      console.log("Autoplay diblokir:", error);
      musicIcon.src = "./assets/no-sound.png";
      enableAudioRecovery();
    });
}
function tryPlayAudio(source) {
  audio
    .play()
    .then(() => {
      musicIcon.src = "./assets/sound.png";
      console.log("Audio diputar ulang dari:", source);
    })
    .catch((err) => {
      console.log("Gagal putar ulang audio dari", source, ":", err);
      enableAudioRecovery();
    });
}
function enableAudioRecovery() {
  const recoverPlay = () => {
    if (!userPaused && audio.paused) {
      audio
        .play()
        .then(() => (musicIcon.src = "./assets/sound.png"))
        .catch((err) => console.log("Gagal dari interaksi user:", err));
    }
    document.removeEventListener("click", recoverPlay);
    document.removeEventListener("touchstart", recoverPlay);
    document.removeEventListener("keydown", recoverPlay);
  };
  ["click", "touchstart", "keydown"].forEach((evt) => {
    document.addEventListener(evt, recoverPlay, { once: true });
  });
}

let audio = document.getElementById("bgMusic");
let musicIcon = document.getElementById("musicIcon");
let userPaused = false;
let lastAttempt = Date.now();
function toggleMusic() {
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        musicIcon.src = "./assets/sound.png";
        userPaused = false;
      })
      .catch((err) => console.log("Gagal memutar audio:", err));
  } else {
    audio.pause();
    musicIcon.src = "./assets/no-sound.png";
    userPaused = true;
  }
}

const dashboardParams = new URLSearchParams(window.location.search);
if (dashboardParams.has("dashboard")) {
  window.location.href = "/dashboard.html";
}
