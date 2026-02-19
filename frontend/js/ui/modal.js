export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("d-none");
  el.setAttribute("aria-hidden", "false");
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("d-none");
  el.setAttribute("aria-hidden", "true");
}

export function wireModalClose() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-modal-close]");
    if (!btn) return;
    const id = btn.getAttribute("data-modal-close");
    closeModal(id);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    // close any open overlay
    document.querySelectorAll(".modal-overlay").forEach((m) => {
      if (!m.classList.contains("d-none")) m.classList.add("d-none");
    });
  });
}
