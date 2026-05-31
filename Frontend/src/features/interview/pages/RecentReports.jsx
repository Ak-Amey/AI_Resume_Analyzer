import { useNavigate } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";

const RecentReports = () => {
    const { reports, loading } = useInterview();
    const navigate = useNavigate();

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading reports...</h1>
            </main>
        );
    }

    return (
        <div className="reports-page">
            <header className="page-header">
                <h1>My <span className="highlight">Interview Plans</span></h1>
                <p>All your previously generated interview strategies in one place.</p>
            </header>

            {reports.length === 0 ? (
                <div className="reports-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p>No reports yet. Generate your first interview plan on the Home page.</p>
                    <button className="generate-btn" onClick={() => navigate("/")}>
                        Go to Home
                    </button>
                </div>
            ) : (
                <ul className="reports-grid">
                    {reports.map((report) => (
                        <li
                            key={report._id}
                            className="report-card"
                            onClick={() => navigate(`/interview/${report._id}`)}
                        >
                            <div className="report-card__header">
                                <h3 className="report-card__title">
                                    {report.title || "Untitled Position"}
                                </h3>
                                <span
                                    className={`report-card__score ${
                                        report.matchScore >= 80
                                            ? "score--high"
                                            : report.matchScore >= 60
                                            ? "score--mid"
                                            : "score--low"
                                    }`}
                                >
                                    {report.matchScore}%
                                </span>
                            </div>
                            <p className="report-card__date">
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <span className="report-card__cta">View Plan →</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecentReports;
