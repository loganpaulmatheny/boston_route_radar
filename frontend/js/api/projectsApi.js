async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export async function getProjects() {
  const res = await fetch("/api/projects");
  return parseJson(res);
}

export async function createProject(payload) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function updateProject(id, payload) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function deleteProject(id) {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  return parseJson(res);
}
