import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post("/api/auth/register", { username, email, password });
        return response.data;
    }
    catch (err) {
        console.error("Error registering user:", err);
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", { email, password });
        return response.data;
    }
    catch (err) {
        console.error("Error logging in user:", err);
    }
}

export async function logout() {
    try {
        await api.post("/api/auth/logout", {});

    }
    catch (err) {
        console.error("Error logging out user:", err);
    }
}

export async function getCurrentUser() {
    try {
        const response = await api.get("/api/auth/getuser");
        return response.data;
    }
    catch (err) {
        console.error("Error fetching current user:", err);
    }
}