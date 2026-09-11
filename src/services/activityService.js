import API from "./api";

// Get recent global activities
export const getRecentActivities = () => {
    return API.get("/activities");
};