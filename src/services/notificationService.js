import API from "./api";

// Get current user's notifications
export const getNotifications = () => {
    return API.get("/notifications");
};

// Get unread notification count
export const getUnreadCount = () => {
    return API.get("/notifications/unread-count");
};

// Mark one notification as read
export const markNotificationAsRead = (notificationId) => {
    return API.put(
        `/notifications/${notificationId}/read`
    );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
    return API.put("/notifications/read-all");
};

// Delete notification
export const deleteNotification = (notificationId) => {
    return API.delete(
        `/notifications/${notificationId}`
    );
};

// Create notification
export const createNotification = (data) => {
    return API.post(
        "/notifications",
        data
    );
};