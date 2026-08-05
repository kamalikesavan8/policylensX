const API_URL = import.meta.env.VITE_API_URL;

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

export const authApi = {
  register: (email: string, password: string) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
};

export const documentApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/api/documents/upload", { method: "POST", body: formData });
  },
  analyzeText: (text: string) =>
    request("/api/documents/analyze-text", { method: "POST", body: JSON.stringify({ text }) }),
  analyzeUrl: (url: string) =>
    request("/api/documents/analyze-url", { method: "POST", body: JSON.stringify({ url }) }),
  getClauses: (id: number) => request(`/api/documents/${id}/clauses`),
  getRelations: (id: number) => request(`/api/documents/${id}/relations`),
  getObligations: (id: number) => request(`/api/documents/${id}/obligations`),
  getAll: () => request("/api/documents"),
  downloadPdf: async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${id}/report/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.blob();
},
};