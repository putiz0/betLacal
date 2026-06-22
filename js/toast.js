function showToast(message, type = "success", duration = 4000) {
  const existing = document.querySelector(".toast-container");
  let container = existing;
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span><span class="toast-msg">${message}</span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  const close = () => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 300);
  };

  toast.addEventListener("click", close);

  if (duration > 0) {
    setTimeout(close, duration);
  }
}
