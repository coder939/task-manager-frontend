import API from "./api";

// Get all users
export const getUsers = () => {
    return API.get("/users");
};

// Get user profile
export const getProfile = () => {
    return API.get("/users/profile");
};

// Update user role - Admin only
export const updateUserRole = (userId, role) => {
    return API.put(`/users/${userId}/role`, {
        role,
    });
};

// Delete user - Admin only
export const deleteUser = (userId) => {
    return API.delete(`/users/${userId}`);
};