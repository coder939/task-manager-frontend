import API from "./api";

export const getProjectChatMessages = (
    projectId
) => {
    return API.get(
        `/chat/projects/${projectId}/messages`
    );
};

export const getProjectChatUnreadCount = (
    projectId
) => {
    return API.get(
        `/chat/projects/${projectId}/unread-count`
    );
};

export const sendProjectChatMessage = (
    projectId,
    text
) => {
    return API.post(
        `/chat/projects/${projectId}/messages`,
        { text }
    );
};

export const uploadProjectChatFile = (
    projectId,
    file,
    text = ""
) => {
    const formData = new FormData();

    formData.append("file", file);

    if (text.trim()) {
        formData.append("text", text.trim());
    }

    return API.post(
        `/chat/projects/${projectId}/files`,
        formData
    );
};

export const markProjectChatRead = (
    projectId
) => {
    return API.post(
        `/chat/projects/${projectId}/read`
    );
};

export const deleteProjectChatMessage = (
    projectId,
    messageId
) => {
    return API.delete(
        `/chat/projects/${projectId}/messages/${messageId}`
    );
};

export const deleteProjectChatAttachment = (
    projectId,
    messageId
) => {
    return API.delete(
        `/chat/projects/${projectId}/messages/${messageId}/attachment`
    );
};
