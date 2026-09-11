import API from "./api";

// Get all projects for logged-in user
export const getProjects = () => {
    return API.get("/projects");
};

export const createProject = (projectData) => {
    return API.post("/projects", projectData);
};

export const updateProject = (projectId, projectData) => {
    return API.put(`/projects/${projectId}`, projectData);
};

export const deleteProject = (projectId) => {
    return API.delete(`/projects/${projectId}`);
};

// Add member to project
export const addMember = (projectId, userId) => {
    return API.post("/projects/add-member", {
        projectId,
        userId,
    });
};

// Get project members
export const getProjectMembers = (projectId) => {
    return API.get(`/projects/${projectId}/members`);
};

// Remove member from project
export const removeMember = (projectId, userId) => {
    return API.delete(
        `/projects/${projectId}/members/${userId}`
    );
};