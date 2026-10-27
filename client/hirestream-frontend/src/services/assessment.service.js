import api from "./api";
export const startAssessment = (applicationId) => api.get(`/assessments/${applicationId}/start`);
export const submitAssessment = (applicationId, data) => api.post(`/assessments/${applicationId}/submit`, data);
export const getAssessmentResult = (applicationId) => api.get(`/assessments/${applicationId}/result`);
