import api from "./api";
export const getRecruiterAnalytics = () => api.get("/analytics/recruiter");
export const getInterviewerStats = () => api.get("/analytics/interviewer");
