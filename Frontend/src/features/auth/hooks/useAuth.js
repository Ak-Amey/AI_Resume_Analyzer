import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context.jsx"
import {login, register, logout, getCurrentUser} from "../services/auth.api.js"

export const useAuth = () => {
    const { user, setUser, loading, setLoading } = useContext(AuthContext);

    const handleLogin = async (email, password) => {
        setLoading(true);
        try{
            const userData = await login({ email, password });
            setUser(userData.user);
            localStorage.setItem("isLoggedIn", "true");
        }
        catch (err) {
            console.error("Error logging in user:", err);
        }
        finally {
            setLoading(false);
        }
    }

    const handleRegister = async (username, email, password) => {
        setLoading(true);
        try{
            const userData = await register({ username, email, password });
            setUser(userData.user);
            localStorage.setItem("isLoggedIn", "true");
        }
        catch (err) {
            console.error("Error registering user:", err);
        }
        finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        setLoading(true);
        try{
            await logout();
            setUser(null);
            localStorage.removeItem("isLoggedIn");
        }
        catch (err) {
            console.error("Error logging out user:", err);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            setLoading(true);
            try {
                const userData = await getCurrentUser();
                setUser(userData.user);
            }
            catch (err) {
                console.error("Error fetching current user:", err);
                localStorage.removeItem("isLoggedIn");
            }
            finally{
                setLoading(false);
            }
        };
        if (localStorage.getItem("isLoggedIn")) {
            getAndSetUser();
        } else {
            setLoading(false);
        }
    }, []);
    return { user, loading, handleLogin, handleRegister, handleLogout};
}