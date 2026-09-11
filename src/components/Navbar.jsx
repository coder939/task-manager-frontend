import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notificationService";


function Navbar({
    setSidebarOpen,
    darkMode,
    setDarkMode,
}) {
    const { logout, user } = useContext(AuthContext);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const notificationRef = useRef(null);

    // Theme colors
    const colors = {
        navbar: darkMode ? "#1f2937" : "#ffffff",
        text: darkMode ? "#f9fafb" : "#111827",
        secondaryText: darkMode ? "#d1d5db" : "#444",
        border: darkMode ? "#374151" : "#ddd",
        dropdown: darkMode ? "#1f2937" : "#ffffff",
        notificationRead: darkMode ? "#1f2937" : "#ffffff",
        notificationUnread: darkMode ? "#263b55" : "#eef6ff",
        notificationBorder: darkMode ? "#374151" : "#eee",
        muted: darkMode ? "#9ca3af" : "#777",
    };

    // Load notifications
    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();

            setNotifications(
                res.data.notifications || []
            );
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );
        }
    };

    // Load unread count
    const fetchUnreadCount = async () => {
        try {
            const res = await getUnreadCount();

            setUnreadCount(
                res.data.count || 0
            );
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );
        }
    };

    // Load notifications when Navbar starts
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Mark one notification as read
    const handleNotificationClick = async (
        notification
    ) => {
        try {
            if (!notification.isRead) {
                await markNotificationAsRead(
                    notification._id
                );

                setNotifications((prev) =>
                    prev.map((item) =>
                        item._id === notification._id
                            ? {
                                  ...item,
                                  isRead: true,
                              }
                            : item
                    )
                );

                setUnreadCount((prev) =>
                    Math.max(prev - 1, 0)
                );
            }
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );
        }
    };

    // Notification icon
   const getNotificationIcon = (
    type
) => {
    switch (type) {
        case "project-assigned":
            return "👥";

        case "task-assigned":
            return "📝";

        case "task-updated":
            return "✏️";

        case "task-status-changed":
            return "🔄";

        case "attachment-uploaded":
            return "📎";

        case "comment-added":
            return "💬";

        case "role-changed":
            return "🛡️";

        case "task-due":
            return "⏰";

        default:
            return "🔔";
    }
};

    // Format notification date
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString();
    };

    return (
        <>
            <div
                style={{
                    height: "70px",
                    backgroundColor: colors.navbar,
                    color: colors.text,

                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",

                    padding: "0 25px",

                    borderBottom:
                        `1px solid ${colors.border}`,

                    boxSizing: "border-box",

                    position: "sticky",
                    top: 0,
                    zIndex: 1000,

                    transition:
                        "background-color 0.2s ease, color 0.2s ease",
                }}
            >
                {/* Left side */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        minWidth: 0,
                    }}
                >
                    {/* Mobile menu */}
                    <button
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        className="mobile-menu-button navbar-btn"
                        style={{
                            border: "none",
                            background: "transparent",
                            color: colors.text,
                            fontSize: "25px",
                            cursor: "pointer",
                            padding: "5px",
                        }}
                    >
                        ☰
                    </button>

                    <h2
                        style={{
                            margin: 0,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Task Manager
                    </h2>
                </div>

                {/* Right side */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                    }}
                >
                    {/* User name */}
                    {user?.name && (
                        <span
                            className="navbar-user-name"
                            style={{
                                fontWeight: "500",
                                color: colors.secondaryText,
                            }}
                        >
                            👤 {user.name}
                        </span>
                    )}

                    {/* 🌙 Dark Mode */}
                    <button
                        onClick={() =>
                            setDarkMode((prev) => !prev)
                        }
                        title={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        className="navbar-btn theme-toggle"
                        style={{
                            border: "none",
                            background: "transparent",
                            color: colors.text,
                            fontSize: "23px",
                            cursor: "pointer",
                            padding: "5px 8px",
                        }}
                    >
                        <span
                            className="theme-icon"
                            key={darkMode ? "sun" : "moon"}
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </span>
                    </button>

                    {/* 🔔 Notifications */}
                    <div
                        ref={notificationRef}
                        style={{
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={() =>
                                setShowNotifications(
                                    (prev) => !prev
                                )
                            }
                            className="navbar-btn bell-btn"
                            style={{
                                position: "relative",
                                border: "none",
                                background:
                                    "transparent",
                                fontSize: "25px",
                                cursor: "pointer",
                                padding: "5px 10px",
                            }}
                            title="Notifications"
                        >
                            <span
                                className={
                                    unreadCount > 0
                                        ? "bell-shake"
                                        : ""
                                }
                            >
                                🔔
                            </span>

                            {/* Unread Badge */}
                            {unreadCount > 0 && (
                                <span
                                    className="unread-badge"
                                    style={{
                                        position: "absolute",
                                        top: "-2px",
                                        right: "0",
                                        backgroundColor:
                                            "#dc3545",
                                        color: "white",
                                        borderRadius: "50%",
                                        minWidth: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        display: "flex",
                                        justifyContent:
                                            "center",
                                        alignItems:
                                            "center",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div
                                className="notification-dropdown"
                                style={{
                                    position: "absolute",
                                    top: "50px",
                                    right: "0",

                                    width: "360px",
                                    maxWidth:
                                        "calc(100vw - 30px)",
                                    maxHeight: "500px",

                                    overflowY: "auto",

                                    backgroundColor:
                                        colors.dropdown,

                                    color: colors.text,

                                    border:
                                        `1px solid ${colors.border}`,

                                    borderRadius: "10px",

                                    boxShadow:
                                        "0 5px 20px rgba(0,0,0,0.15)",

                                    padding: "10px",

                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        padding: "10px",

                                        borderBottom:
                                            `1px solid ${colors.notificationBorder}`,

                                        gap: "10px",
                                    }}
                                >
                                    <strong>
                                        🔔 Notifications
                                    </strong>

                                    {unreadCount > 0 && (
                                        <button
                                            onClick={
                                                handleMarkAllAsRead
                                            }
                                            className="mark-all-btn"
                                            style={{
                                                border: "none",
                                                background:
                                                    "transparent",

                                                color:
                                                    darkMode
                                                        ? "#60a5fa"
                                                        : "#007bff",

                                                cursor:
                                                    "pointer",

                                                fontSize:
                                                    "13px",

                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications */}
                                {notifications.length ===
                                0 ? (
                                    <p
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "25px",
                                            color:
                                                colors.muted,
                                        }}
                                    >
                                        No notifications 🔕
                                    </p>
                                ) : (
                                    notifications.map(
                                        (
                                            notification,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    notification._id
                                                }
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        notification
                                                    )
                                                }
                                                className="notification-item"
                                                style={{
                                                    padding:
                                                        "12px",

                                                    borderBottom:
                                                        `1px solid ${colors.notificationBorder}`,

                                                    cursor:
                                                        "pointer",

                                                    backgroundColor:
                                                        notification.isRead
                                                            ? colors.notificationRead
                                                            : colors.notificationUnread,

                                                    borderRadius:
                                                        "6px",

                                                    marginBottom:
                                                        "3px",

                                                    animationDelay: `${index * 0.04}s`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "10px",
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "20px",
                                                        }}
                                                    >
                                                        {getNotificationIcon(
                                                            notification.type
                                                        )}
                                                    </span>

                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                margin: 0,

                                                                fontWeight:
                                                                    notification.isRead
                                                                        ? "normal"
                                                                        : "bold",

                                                                overflowWrap:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <small
                                                            style={{
                                                                color:
                                                                    colors.muted,
                                                            }}
                                                        >
                                                            {formatDate(
                                                                notification.createdAt
                                                            )}
                                                        </small>
                                                    </div>

                                                    {!notification.isRead && (
                                                        <span
                                                            className="unread-dot"
                                                            style={{
                                                                width:
                                                                    "8px",
                                                                height:
                                                                    "8px",

                                                                backgroundColor:
                                                                    "#007bff",

                                                                borderRadius:
                                                                    "50%",

                                                                marginTop:
                                                                    "5px",

                                                                flexShrink:
                                                                    0,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="logout-btn"
                        style={{
                            padding: "10px 18px",
                            cursor: "pointer",
                            border: "none",
                            borderRadius: "6px",
                            backgroundColor: "#dc3545",
                            color: "white",
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Responsive CSS */}
            <style>
                {`
                    @keyframes dropdownFadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(-8px) scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    @keyframes fadeSlideIn {
                        from {
                            opacity: 0;
                            transform: translateX(-6px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes badgePop {
                        0% {
                            transform: scale(0);
                        }
                        60% {
                            transform: scale(1.2);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }

                    @keyframes bellRing {
                        0%, 100% {
                            transform: rotate(0deg);
                        }
                        20% {
                            transform: rotate(12deg);
                        }
                        40% {
                            transform: rotate(-10deg);
                        }
                        60% {
                            transform: rotate(6deg);
                        }
                        80% {
                            transform: rotate(-4deg);
                        }
                    }

                    @keyframes dotPulse {
                        0% {
                            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.5);
                        }
                        70% {
                            box-shadow: 0 0 0 6px rgba(0, 123, 255, 0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
                        }
                    }

                    @keyframes iconPop {
                        from {
                            opacity: 0;
                            transform: scale(0.5) rotate(-30deg);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) rotate(0deg);
                        }
                    }

                    .navbar-btn {
                        transition: transform 0.15s ease, background-color 0.15s ease;
                        border-radius: 6px;
                    }

                    .navbar-btn:hover {
                        transform: translateY(-1px) scale(1.08);
                        background-color: rgba(128, 128, 128, 0.12) !important;
                    }

                    .navbar-btn:active {
                        transform: scale(0.95);
                    }

                    .theme-icon {
                        display: inline-block;
                        animation: iconPop 0.3s ease;
                    }

                    .bell-shake {
                        display: inline-block;
                        animation: bellRing 0.6s ease;
                        animation-iteration-count: 1;
                    }

                    .unread-badge {
                        animation: badgePop 0.3s ease;
                    }

                    .unread-dot {
                        animation: dotPulse 1.8s infinite;
                    }

                    .notification-dropdown {
                        animation: dropdownFadeIn 0.2s ease;
                        transform-origin: top right;
                    }

                    .notification-item {
                        animation: fadeSlideIn 0.25s ease both;
                        transition: transform 0.15s ease, filter 0.15s ease;
                    }

                    .notification-item:hover {
                        transform: translateX(3px);
                        filter: brightness(0.97);
                    }

                    .mark-all-btn {
                        transition: opacity 0.15s ease;
                    }

                    .mark-all-btn:hover {
                        opacity: 0.7;
                    }

                    .logout-btn {
                        transition: transform 0.15s ease, box-shadow 0.15s ease;
                    }

                    .logout-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 10px rgba(220, 53, 69, 0.35);
                    }

                    .logout-btn:active {
                        transform: translateY(0) scale(0.97);
                    }

                    .mobile-menu-button {
                        display: none;
                    }

                    @media (max-width: 768px) {
                        .mobile-menu-button {
                            display: block;
                        }

                        .navbar-user-name {
                            display: none;
                        }

                        .notification-dropdown {
                            position: fixed !important;
                            top: 70px !important;
                            right: 10px !important;
                            width: calc(100vw - 20px) !important;
                            max-width: 400px !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .notification-dropdown {
                            right: 10px !important;
                            left: 10px !important;
                            width: auto !important;
                            max-width: none !important;
                        }
                    }
                `}
            </style>
        </>
    );
}

export default Navbar;