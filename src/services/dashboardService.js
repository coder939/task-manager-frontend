import API from "./api";

// Get global dashboard overview
export const getDashboardOverview = () => {
    return API.get("/dashboard");
};

// Get project-specific statistics
export const getProjectStats = (projectId) => {
    return API.get(`/dashboard/${projectId}`);
};