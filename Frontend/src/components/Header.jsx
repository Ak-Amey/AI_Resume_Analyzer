import { Link, useLocation, useNavigate } from "react-router";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function Header() {
    const { user, handleLogout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const onLogout = async () => {
        setProfileOpen(false);
        await handleLogout();
        navigate("/login");
    };

    const isActive = (path) =>
        location.pathname === path ? " nav-link--active" : "";

    return (
        <header className="app-header">
            <div className="app-header__brand">
                <Link to="/">AI Resume Analyzer</Link>
            </div>

            <nav className="app-header__nav">
                <Link to="/" className={`nav-link${isActive("/")}`}>
                    Home
                </Link>
                <Link to="/reports" className={`nav-link${isActive("/reports")}`}>
                    Recent Reports
                </Link>
            </nav>

            <div className="app-header__profile" ref={profileRef}>
                <button
                    className="profile-trigger"
                    onClick={() => setProfileOpen((o) => !o)}
                >
                    <span className="profile-trigger__avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </span>
                    <span className="profile-trigger__name">{user?.username}</span>
                    <svg
                        className={`profile-trigger__chevron${profileOpen ? " profile-trigger__chevron--open" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {profileOpen && (
                    <div className="profile-dropdown">
                        <div className="profile-dropdown__info">
                            <span className="profile-dropdown__avatar-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <div>
                                <p className="profile-dropdown__name">{user?.username}</p>
                                <p className="profile-dropdown__email">{user?.email}</p>
                            </div>
                        </div>
                        <div className="profile-dropdown__divider" />
                        <button className="profile-dropdown__logout" onClick={onLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
