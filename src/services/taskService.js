import API from "./api";

// Get all tasks from projects the logged-in user belongs to
export const getMyTasks = () => {
    return API.get("/tasks");
};

// Get tasks by project with pagination, search and filtering
export const getTasksv1 = (//v1
    projectId,
    page = 1,
    limit = 10,
    search = "",
    status = ""
) => {
    return API.get(
        `/tasks/${projectId}?page=${page}&limit=${limit}&search=${search}&status=${status}`
    );
};

// Get all tasks
export const getTasks = () => {
    return API.get("/tasks");
};

// Create task
export const createTask = (taskData) => {
    return API.post("/tasks", taskData);
};

// Update task
export const updateTask = (taskId, taskData) => {
    return API.put(`/tasks/${taskId}`, taskData);
};

// Delete task
export const deleteTask = (taskId) => {
    return API.delete(`/tasks/${taskId}`);
};

// Update task status
export const updateTaskStatus = (taskId, status) => {
    return API.put(`/tasks/${taskId}/status`, { status });
};

// Get task attachments
export const getTaskAttachments = (taskId) => {
    return API.get(`/tasks/${taskId}/attachments`);
};

// Upload task attachment
export const uploadTaskAttachment = (taskId, file) => {
    const formData = new FormData();

    formData.append("file", file);

    return API.post(
        `/tasks/${taskId}/attachments`,
        formData
    );
};

// Delete task attachment
export const deleteTaskAttachment = (taskId, attachmentId) => {
    return API.delete(
        `/tasks/${taskId}/attachments/${attachmentId}`
    );
};

// Get task comments
export const getTaskComments = (taskId) => {
    return API.get(`/comments/${taskId}`);
};

// Add comment
export const createComment = (taskId, content) => {
    return API.post(`/comments/${taskId}`, {
        content
    });
};

// Delete comment
export const deleteComment = (commentId) => {
    return API.delete(`/comments/${commentId}`);
};