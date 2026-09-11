import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getUsers,
    updateUserRole,
    deleteUser,
} from "../services/userService";
import { toast } from "react-toastify";
import {
    createNotification,
} from "../services/notificationService";

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [updatingRoleFor, setUpdatingRoleFor] = useState(null);
    const [deletingUserFor, setDeletingUserFor] = useState(null);

    // =========================================================
    // CONFIRMATION MODAL
    // =========================================================

    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        onConfirm: null,
    });

    const openConfirm = (
        title,
        message,
        onConfirm,
        confirmText = "Confirm"
    ) => {
        setConfirmState({
            open: true,
            title,
            message,
            confirmText,
            onConfirm,
        });
    };

    const closeConfirm = () => {
        setConfirmState({
            open: false,
            title: "",
            message: "",
            confirmText: "Confirm",
            onConfirm: null,
        });
    };

    const handleConfirm = async () => {
        if (confirmState.onConfirm) {
            await confirmState.onConfirm();
        }

        closeConfirm();
    };

    // =========================================================
    // LOAD USERS
    // =========================================================

    const fetchUsers = async () => {
        try {
            const res = await getUsers();

            setUsers(
                res.data.users ||
                []
            );
        } catch (err) {
            console.log(
                err.response?.data ||
                err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // =========================================================
    // UPDATE ROLE
    // =========================================================

    const handleRoleChange = async (
    userId,
    newRole
) => {
    setUpdatingRoleFor(
        userId
    );

    try {
        await updateUserRole(
            userId,
            newRole
        );

        toast.success(
            "User role updated successfully!"
        );

        try {
            await createNotification({
                recipientId:
                    userId,

                type:
                    "role-changed",

                message:
                    `Your account role was changed to ${
                        newRole ===
                        "admin"
                            ? "Administrator"
                            : "User"
                    }.`,
            });
        } catch (
            notificationError
        ) {
            console.log(
                "Notification failed:",
                notificationError
                    .response
                    ?.data ||
                    notificationError
                        .message
            );
        }

        await fetchUsers();
    } catch (err) {
        console.log(
            err.response?.data ||
                err.message
        );

        toast.error(
            err.response?.data
                ?.message ||
                "Failed to update user role"
        );
    } finally {
        setUpdatingRoleFor(
            null
        );
    }
};

    // =========================================================
    // DELETE USER
    // =========================================================

    const handleDeleteUser = (
        userId,
        userName
    ) => {
        openConfirm(
            "Delete User?",
            `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
            async () => {
                setDeletingUserFor(userId);

                try {
                    await deleteUser(userId);

                    toast.success(
                        "User deleted successfully!"
                    );

                    await fetchUsers();
                } catch (err) {
                    console.log(
                        err.response?.data ||
                        err.message
                    );

                    toast.error(
                        err.response?.data?.message ||
                        "Failed to delete user"
                    );
                } finally {
                    setDeletingUserFor(null);
                }
            },
            "Delete"
        );
    };

    // =========================================================
    // STYLES
    // =========================================================

    const styles = `
        @keyframes fadeSlideIn {
            from {
                opacity: 0;
                transform: translateY(12px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes skeletonPulse {
            0% {
                opacity: 1;
            }

            50% {
                opacity: 0.55;
            }

            100% {
                opacity: 1;
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        /* =====================================================
           CONFIRMATION MODAL
        ===================================================== */

        .confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
            animation: fadeSlideIn 0.2s ease both;
        }

        .confirm-box {
            width: 100%;
            max-width: 420px;
            padding: 25px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            box-shadow:
                0 15px 45px
                rgba(0, 0, 0, 0.25);
            text-align: center;
            animation: popIn 0.25s ease both;
        }

        .confirm-icon {
            width: 55px;
            height: 55px;
            margin: 0 auto 15px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                rgba(220, 53, 69, 0.12);
            font-size: 25px;
        }

        .confirm-box h3 {
            margin: 0 0 10px;
            font-size: 20px;
        }

        .confirm-box p {
            margin: 0;
            line-height: 1.5;
            opacity: 0.75;
            font-size: 14px;
        }

        .confirm-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 22px;
        }

        .confirm-actions button {
            min-width: 100px;
            padding: 9px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        /* =====================================================
           PAGE HEADER
        ===================================================== */

        .users-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 4px;
        }

        .users-title {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
        }

        .users-count {
            font-size: 13px;
            opacity: 0.6;
            font-weight: 500;
        }

        .users-description {
            margin: 8px 0 20px;
            opacity: 0.7;
            font-size: 14px;
        }

        /* =====================================================
           USER CARD
        ===================================================== */

        .user-card {
            animation: fadeSlideIn 0.35s ease both;
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
            position: relative;
            padding: 20px;
            background: var(--card-bg);
            color: var(--text-color);
            border:
                1px solid
                var(--border-color);
            border-radius: 12px;
            box-shadow:
                0 2px 6px
                var(--shadow-color);
        }

        .user-card:hover {
            transform: translateY(-3px);
            box-shadow:
                0 6px 16px
                var(--shadow-color);
        }

        .user-top {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            flex-shrink: 0;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #3b82f6;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-main-info {
            flex: 1;
            min-width: 0;
        }

        .user-name {
            margin: 0 0 3px;
            font-size: 18px;
            font-weight: 700;
        }

        .user-email {
            margin: 0;
            opacity: 0.65;
            font-size: 13px;
            word-break: break-word;
        }

        /* =====================================================
           ROLE PANEL
        ===================================================== */

        /* =====================================================
   ROLE
===================================================== */

.role-panel {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 11px 13px;
    background:
        var(
            --section-bg,
            var(--card-bg)
        );
    border:
        1px solid
        var(--border-color);
    border-radius: 9px;
}

.role-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.role-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.55;
}

.role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.role-badge.user {
    background:
        rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border:
        1px solid
        rgba(59, 130, 246, 0.25);
}

.role-badge.admin {
    background:
        rgba(245, 158, 11, 0.1);
    color: #d97706;
    border:
        1px solid
        rgba(245, 158, 11, 0.3);
}

.role-select {
    width: 105px;
    padding: 7px 9px;
    cursor: pointer;
    background: var(--card-bg);
    color: var(--text-color);
    border:
        1px solid
        var(--border-color);
    border-radius: 7px;
    outline: none;
    font-size: 12.5px;
    font-weight: 500;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.15s ease;
}

.role-select:hover:not(:disabled) {
    transform: translateY(-1px);
}

.role-select:focus {
    border-color: #3b82f6;
    box-shadow:
        0 0 0 3px
        rgba(59, 130, 246, 0.12);
}

.role-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 480px) {
    .role-panel {
        padding: 10px 11px;
    }

    .role-select {
        width: 95px;
    }
}
        /* =====================================================
           ACTIONS
        ===================================================== */

        .user-actions {
            display: flex;
            gap: 10px;
            margin-top: 14px;
            flex-wrap: wrap;
        }

        .user-actions button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-animated {
            transition:
                transform 0.15s ease,
                opacity 0.15s ease,
                box-shadow 0.15s ease;
        }

        .btn-animated:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
                0 3px 8px
                var(--shadow-color);
        }

        .btn-animated:active:not(:disabled) {
            transform:
                translateY(0)
                scale(0.97);
        }

        .btn-animated:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-secondary {
            background:
                var(--card-bg) !important;
            color:
                var(--text-color) !important;
            border:
                1px solid
                var(--border-color) !important;
        }

        .btn-danger {
            background: #dc3545 !important;
            color: #ffffff !important;
            border: none !important;
        }

        .btn-danger:hover:not(:disabled) {
            box-shadow:
                0 4px 12px
                rgba(220, 53, 69, 0.4) !important;
        }

        .btn-spinner {
            width: 14px;
            height: 14px;
            border:
                2px solid
                rgba(255, 255, 255, 0.4);
            border-top-color: white;
            border-radius: 50%;
            display: inline-block;
            animation:
                spin 0.6s
                linear infinite;
            vertical-align: middle;
            margin-right: 6px;
        }

        /* =====================================================
           SKELETONS
        ===================================================== */

        .skeleton-block {
            background: var(--border-color);
            border-radius: 6px;
            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        .user-skeleton {
            padding: 20px;
            background: var(--card-bg);
            border:
                1px solid
                var(--border-color);
            border-radius: 12px;
            box-shadow:
                0 2px 6px
                var(--shadow-color);
            animation:
                fadeSlideIn
                0.3s ease both;
        }

        .skeleton-user-top {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .skeleton-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .empty-state-fade {
            animation:
                fadeSlideIn
                0.3s ease both;
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 700px) {
            .users-title {
                font-size: 23px;
            }

            .role-row {
                flex-direction: column;
                align-items: flex-start;
            }

            .role-select-wrapper {
                width: 100%;
            }

            .role-select {
                flex: 1;
            }

            .user-actions button {
                flex: 1;
            }
        }

        @media (max-width: 480px) {
            .users-title {
                font-size: 21px;
            }

            .user-card {
                padding: 15px;
            }

            .confirm-box {
                padding: 20px;
            }

            .confirm-actions {
                flex-direction: column;
            }

            .confirm-actions button {
                width: 100%;
            }

            .user-top {
                align-items: flex-start;
            }
        }
    `;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Layout>
            <style>{styles}</style>

            {/* =================================================
                CONFIRMATION MODAL
            ================================================= */}

            {confirmState.open && (
                <div
                    className="confirm-overlay"
                    onClick={closeConfirm}
                >
                    <div
                        className="confirm-box"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="confirm-icon">
                            🗑
                        </div>

                        <h3>
                            {confirmState.title}
                        </h3>

                        <p>
                            {confirmState.message}
                        </p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="btn-animated btn-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="btn-animated btn-danger"
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="users-header">
                <h1 className="users-title">
                    👥 User Management
                </h1>

                <span className="users-count">
                    {users.length} total
                </span>
            </div>

            <p className="users-description">
                Manage registered users and their roles.
            </p>

            {/* =================================================
                USER LIST
            ================================================= */}

            {loading ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    {[1, 2, 3, 4, 5].map(
                        (item) => (
                            <div
                                key={item}
                                className="user-skeleton"
                            >
                                <div className="skeleton-user-top">
                                    <div className="skeleton-block skeleton-avatar" />

                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <div
                                            className="skeleton-block"
                                            style={{
                                                width: "35%",
                                                height: "19px",
                                                marginBottom: "8px",
                                            }}
                                        />

                                        <div
                                            className="skeleton-block"
                                            style={{
                                                width: "55%",
                                                height: "13px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="skeleton-block"
                                    style={{
                                        width: "100%",
                                        height: "70px",
                                        marginTop: "16px",
                                    }}
                                />

                                <div
                                    className="skeleton-block"
                                    style={{
                                        width: "100px",
                                        height: "34px",
                                        marginTop: "14px",
                                    }}
                                />
                            </div>
                        )
                    )}
                </div>
            ) : users.length === 0 ? (
                <p className="empty-state-fade">
                    No users found.
                </p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    {users.map(
                        (user, index) => {
                            const isUpdating =
                                updatingRoleFor ===
                                user._id;

                            const isDeleting =
                                deletingUserFor ===
                                user._id;

                            return (
                                <div
                                    key={user._id}
                                    className="user-card"
                                    style={{
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    {/* =========================================
                                        USER INFO
                                    ========================================= */}

                                    <div className="user-top">
                                        <div className="user-avatar">
                                            {user.role ===
                                            "admin"
                                                ? "👑"
                                                : getInitials(
                                                      user.name
                                                  )}
                                        </div>

                                        <div className="user-main-info">
                                            <h3 className="user-name">
                                                {
                                                    user.name
                                                }
                                            </h3>

                                            <p className="user-email">
                                                {
                                                    user.email
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* =========================================
                                        ROLE PANEL
                                    ========================================= */}

                                   <div className="role-panel">
    <div className="role-info">
        <span className="role-label">
            Role
        </span>

        <span
            className={`role-badge ${
                user.role === "admin"
                    ? "admin"
                    : "user"
            }`}
        >
            {user.role === "admin"
                ? "👑 Admin"
                : "👤 User"}
        </span>
    </div>

    <select
        value={user.role}
        disabled={isUpdating}
        onChange={(e) =>
            handleRoleChange(
                user._id,
                e.target.value
            )
        }
        className="role-select"
    >
        <option value="user">
            User
        </option>

        <option value="admin">
            Admin
        </option>
    </select>
</div>
                                    {/* =========================================
                                        ACTION BUTTONS
                                    ========================================= */}

                                    <div className="user-actions">
                                        <button
                                            type="button"
                                            disabled={
                                                isDeleting
                                            }
                                            onClick={() =>
                                                handleDeleteUser(
                                                    user._id,
                                                    user.name
                                                )
                                            }
                                            className="btn-animated btn-danger"
                                        >
                                            {isDeleting && (
                                                <span className="btn-spinner" />
                                            )}

                                            🗑 Delete User
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </Layout>
    );
}

export default UserManagement;