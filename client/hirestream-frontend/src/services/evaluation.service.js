import api from "./api";
export const submitEvaluation = (data) => api.post("/evaluations", data);
export const getEvaluationsByApplication = (applicationId) => api.get(`/evaluations/${applicationId}`);
export const getDefaultCriteria = () => api.get("/evaluations/criteria");
export const getMyEvaluations = () => api.get("/evaluations/my");
