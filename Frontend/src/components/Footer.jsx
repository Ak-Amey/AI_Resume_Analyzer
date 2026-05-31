export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="app-footer__links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </div>
            <p className="app-footer__copy">
                &copy; {new Date().getFullYear()} AI Resume Analyzer
            </p>
        </footer>
    );
}
