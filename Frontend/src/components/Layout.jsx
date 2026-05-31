import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
    return (
        <div className="app-layout">
            <Header />
            <main className="app-layout__content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
