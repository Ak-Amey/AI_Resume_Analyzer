import api from "../../../../services/api";

export async function generateReport({ jobDescription, selfDescription, resumeFile }) {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }
    const response = await api.post("/api/interview/", formData);
    return response.data;
}

export async function getReports() {
    const response = await api.get("/api/interview/");
    return response.data;
}
