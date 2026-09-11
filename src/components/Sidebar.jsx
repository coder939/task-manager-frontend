import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        { to: "/dashboard", icon: "📊", label: "Dashboard" },
        { to: "/projects", icon: "📁", label: "Projects" },
        { to: "/kanban", icon: "🗂️", label: "Kanban" },
        { to: "/tasks", icon: "📝", label: "Tasks" },
        { to: "/profile", icon: "👤", label: "Profile" },
    ];

    if (user?.role === "admin") {
        navItems.push({
            to: "/users",
            icon: "👥",
            label: "User Management",
        });
    }

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="sidebar-overlay"
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        zIndex: 999,
                    }}
                />
            )}

            <aside
                style={{
                    width: "220px",
                    height: "100vh",
                    backgroundColor: "#1f2937",
                    color: "white",
                    padding: "20px",
                    boxSizing: "border-box",
                    position: "fixed",
                    left: sidebarOpen ? "0" : "-260px",
                    top: 0,
                    zIndex: 1000,
                    transition: "left 0.3s ease",
                }}
                className="sidebar"
            >
                <h2 style={{ marginBottom: "30px" }}>
                    Task Manager
                </h2>

                <nav
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    {navItems.map((item, index) => {
                        const isActive =
                            location.pathname === item.to;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                                className={`sidebar-link ${
                                    isActive ? "active" : ""
                                }`}
                                style={{
                                    animationDelay: `${index * 0.04}s`,
                                }}
                            >
                                <span className="sidebar-icon">
                                    {item.icon}
                                </span>{" "}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Desktop sidebar */}
            <style>
                {`
                    @keyframes fadeSlideInLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes overlayFadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    .sidebar-overlay {
                        animation: overlayFadeIn 0.2s ease;
                    }

                    .sidebar-link {
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        color: white;
                        text-decoration: none;
                        font-size: 16px;

                        padding: 10px 12px;
                        border-radius: 8px;

                        animation: fadeSlideInLeft 0.3s ease both;

                        transition:
                            background-color 0.18s ease,
                            transform 0.18s ease,
                            padding-left 0.18s ease;
                    }

                    .sidebar-link:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                        padding-left: 16px;
                    }

                    .sidebar-link:active {
                        transform: scale(0.97);
                    }

                    .sidebar-link.active {
                        background-color: rgba(96, 165, 250, 0.18);
                        font-weight: 600;
                        border-left: 3px solid #60a5fa;
                        padding-left: 13px;
                    }

                    .sidebar-icon {
                        display: inline-block;
                        transition: transform 0.18s ease;
                    }

                    .sidebar-link:hover .sidebar-icon {
                        transform: scale(1.15);
                    }

                    @media (min-width: 769px) {
                        .sidebar {
                            position: sticky !important;
                            left: 0 !important;
                            top: 0 !important;
                            flex-shrink: 0;
                        }
                    }

                    @media (max-width: 768px) {
                        .sidebar {
                            display: block;
                        }
                    }
                `}
            </style>
        </>
    );
}

export default Sidebar;