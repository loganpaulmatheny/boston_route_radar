async function postJSON(url) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const btn = document.getElementById("seed-projects-btn");
const statusEl = document.getElementById("seed-projects-status");

btn.addEventListener("click", async () => {
  statusEl.textContent = "Running…";
  statusEl.className = "mt-3 small text-secondary";

  try {
    const data = await postJSON("/api/admin/seed-projects");

    if (data.seeded) {
      statusEl.textContent = `Seeded. Inserted ${data.count} record(s). (${data.reason})`;
      statusEl.className = "mt-3 small text-success";
    } else {
      statusEl.textContent = `No action needed. Found ${data.count} record(s). (${data.reason})`;
      statusEl.className = "mt-3 small text-primary";
    }
  } catch (e) {
    statusEl.textContent = `Error: ${e.message}`;
    statusEl.className = "mt-3 small text-danger";
  }
});
