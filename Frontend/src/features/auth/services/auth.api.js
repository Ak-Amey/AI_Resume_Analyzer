import api from "../../../services/api";

export async function register({ username, email, password }) {
    const response = await api.post("/api/auth/register", { username, email, password });
    return response.data;
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
}

export async function logout() {
    await api.post("/api/auth/logout", {});
}

export async function getCurrentUser() {
    const response = await api.get("/api/auth/getuser");
    return response.data;
}