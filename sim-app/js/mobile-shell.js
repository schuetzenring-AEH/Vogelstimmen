import { boot } from "./app.js";

function showBootError(message) {
  const screen = document.getElementById("boot-screen");
  if (!screen) return;
  screen.innerHTML = `<p class="boot-title">Start fehlgeschlagen</p><p class="boot-error">${message}</p>`;
}

function hideBootScreen() {
  const screen = document.getElementById("boot-screen");
  if (!screen) return;
  screen.classList.add("done");
  window.setTimeout(() => screen.remove(), 350);
}

function wireSheet() {
  const sheet = document.getElementById("detail-sheet");
  const openBtn = document.getElementById("sheet-open");
  const closeBtn = document.getElementById("sheet-close");
  const backdrop = document.getElementById("sheet-backdrop");
  if (!sheet || !openBtn) return;

  const setOpen = (open) => {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", () => setOpen(false));
  backdrop?.addEventListener("click", () => setOpen(false));

  sheet.querySelectorAll(".sheet-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.getAttribute("data-tab");
      sheet.querySelectorAll(".sheet-tabs .tab").forEach((t) => {
        const on = t === tab;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      sheet.querySelectorAll(".tab-panel").forEach((p) => {
        p.classList.toggle("on", p.getAttribute("data-panel") === name);
      });
    });
  });

  window.openDetailSheet = () => setOpen(true);
}

function wireTouchButtons() {
  document.querySelectorAll(".btn-bird").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener("pointerup", (e) => {
      if (btn.hasPointerCapture?.(e.pointerId)) btn.releasePointerCapture(e.pointerId);
    });
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });
}

function wireVisibilityPause() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const pause = document.getElementById("pause");
      if (pause && pause.textContent === "Pause") pause.click();
    }
  });
}

function wirePartSelectionSheet() {
  const board = document.getElementById("board");
  if (!board) return;
  board.addEventListener("click", (e) => {
    const fp = e.target.closest(".fp");
    if (fp && typeof window.openDetailSheet === "function") {
      window.openDetailSheet();
      const detailTab = document.querySelector('.sheet-tabs .tab[data-tab="detail"]');
      detailTab?.click();
    }
  });
}

function wireOnlineStatus() {
  const msg = document.getElementById("msg");
  window.addEventListener("offline", () => {
    if (msg) msg.textContent = "Offline — Simulation läuft lokal weiter.";
  });
}

async function main() {
  if (location.protocol === "file:") {
    showBootError(
      "Bitte über einen Webserver öffnen (GitHub Pages oder START.bat), nicht als file://.",
    );
    return;
  }

  wireSheet();
  wireVisibilityPause();
  wireOnlineStatus();

  try {
    await boot();
    wireTouchButtons();
    wirePartSelectionSheet();
    hideBootScreen();
  } catch (err) {
    console.error(err);
    showBootError(
      `${err.message || err}. Cache leeren oder Seite neu laden. Bei lokalem Test: START.bat nutzen.`,
    );
  }
}

main();
