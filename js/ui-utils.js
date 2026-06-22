function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setLoading(buttonOrId, loading = true, label = "") {
  const btn = typeof buttonOrId === "string" ? document.getElementById(buttonOrId) : buttonOrId;
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.classList.add("btn-loading");
    btn.disabled = true;
  } else {
    btn.classList.remove("btn-loading");
    btn.disabled = false;
    if (label) btn.textContent = label;
  }
}

function showConfirm(message, title = "Confirmação") {
  return new Promise((resolve) => {
    const existing = document.querySelector(".confirm-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="confirm-box">
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-msg">${message}</p>
        <div class="confirm-actions">
          <button class="ghost-btn confirm-cancel" type="button">Cancelar</button>
          <button class="primary-btn confirm-ok" type="button">Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("confirm-visible"));

    const close = (result) => {
      overlay.classList.remove("confirm-visible");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
      setTimeout(() => overlay.remove(), 300);
      resolve(result);
    };

    overlay.querySelector(".confirm-ok").addEventListener("click", () => close(true));
    overlay.querySelector(".confirm-cancel").addEventListener("click", () => close(false));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });

    const handleKey = (e) => {
      if (e.key === "Escape") { close(false); document.removeEventListener("keydown", handleKey); }
      if (e.key === "Enter") { close(true); document.removeEventListener("keydown", handleKey); }
    };
    document.addEventListener("keydown", handleKey);
    overlay.querySelector(".confirm-cancel").focus();
  });
}
