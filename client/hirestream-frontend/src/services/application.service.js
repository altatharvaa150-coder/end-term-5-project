import api from "./api";
export const applyToJob = (data) => api.post("/applications/apply", data);
export const getMyApplications = () => api.get("/applications/my");
export const getApplicationsByJob = (jobId, params) => api.get(`/applications/job/${jobId}`, { params });
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const moveApplicationStage = (id, data) => api.put(`/applications/${id}/stage`, data);
export const rejectApplication = (id, data) => api.put(`/applications/${id}/reject`, data);
export const makeOffer = (id, data) => api.post(`/applications/${id}/offer`, data);
export const respondToOffer = (id, data) => api.put(`/applications/${id}/offer/respond`, data);
