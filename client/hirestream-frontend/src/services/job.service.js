import api from "./api";
export const getAllJobs = (params) => api.get("/jobs", { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getMyJobs = () => api.get("/jobs/my");
export const getInterviewerJobs = () => api.get("/jobs/interviewer");
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
