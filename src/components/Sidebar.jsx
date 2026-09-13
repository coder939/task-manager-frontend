import {
    Link,
    useLocation,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar({
    sidebarOpen,
    setSidebarOpen,
}) {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        {
            to: "/dashboard",
            icon: "📊",
            label: "Dashboard",
        },
        {
            to: "/projects",
            icon: "📁",
            label: "Projects",
        },
        {
            to: "/kanban",
            icon: "🗂️",
            label: "Kanban",
        },
        {
            to: "/tasks",
            icon: "📝",
            label: "Tasks",
        },
        {
            to: "/profile",
            icon: "👤",
            label: "Profile",
        },
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
            <style>
                {`
                    @keyframes sidebarBackdropIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    .sidebar {
                        width: 230px;
                        flex: 0 0 230px;
                        min-width: 230px;

                        align-self: stretch;
                        min-height: 100vh;
                        min-height: 100dvh;

                        padding: 20px 16px;

                        background:
                            linear-gradient(
                                180deg,
                                #1f2937 0%,
                                #111827 100%
                            );

                        color: #ffffff;

                        box-sizing: border-box;

                        position: relative;
                        z-index: 40;

                        border-right:
                            1px solid
                            rgba(255, 255, 255, 0.06);
                    }

                    .sidebar-inner {
                        position: sticky;
                        top: 18px;

                        display: flex;
                        flex-direction: column;

                        width: 100%;
                    }

                    .sidebar-brand-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;

                        margin-bottom: 28px;
                        padding: 2px 6px;
                    }

                    .sidebar-brand {
                        margin: 0;

                        color: #ffffff;

                        font-size: 21px;
                        line-height: 1.2;
                        letter-spacing: -0.02em;
                    }

                    .sidebar-close {
                        display: none;

                        width: 40px;
                        height: 40px;

                        align-items: center;
                        justify-content: center;

                        flex-shrink: 0;

                        border:
                            1px solid
                            rgba(255, 255, 255, 0.14);

                        border-radius: 10px;

                        background:
                            rgba(255, 255, 255, 0.08);

                        color: #ffffff;

                        font-size: 24px;
                        line-height: 1;

                        cursor: pointer;
                    }

                    .sidebar-nav {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .sidebar-link {
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        min-width: 0;

                        padding: 11px 12px;

                        color: rgba(255, 255, 255, 0.88);
                        text-decoration: none;

                        font-size: 15px;
                        font-weight: 500;
                        line-height: 1.25;

                        border:
                            1px solid
                            transparent;

                        border-radius: 10px;

                        transition:
                            background-color 0.18s ease,
                            border-color 0.18s ease,
                            color 0.18s ease,
                            transform 0.18s ease;
                    }

                    .sidebar-link:hover {
                        background:
                            rgba(255, 255, 255, 0.08);

                        color: #ffffff;

                        transform: translateX(2px);
                    }

                    .sidebar-link:focus-visible,
                    .sidebar-close:focus-visible {
                        outline:
                            3px solid
                            rgba(96, 165, 250, 0.4);

                        outline-offset: 2px;
                    }

                    .sidebar-link.active {
                        background:
                            rgba(59, 130, 246, 0.18);

                        color: #ffffff;

                        border-color:
                            rgba(96, 165, 250, 0.24);

                        box-shadow:
                            inset 3px 0 0 #60a5fa;
                    }

                    .sidebar-icon {
                        width: 22px;

                        display: inline-flex;
                        align-items: center;
                        justify-content: center;

                        flex-shrink: 0;

                        font-size: 18px;
                    }

                    .sidebar-overlay {
                        display: none;
                    }

                    @media (max-width: 768px) {
                        .sidebar {
                            position: fixed;
                            inset:
                                0
                                auto
                                0
                                0;

                            width:
                                min(
                                    82vw,
                                    286px
                                );

                            min-width: 0;
                            height: 100vh;
                            height: 100dvh;
                            min-height: 0;

                            padding:
                                calc(
                                    18px +
                                    env(
                                        safe-area-inset-top,
                                        0px
                                    )
                                )
                                16px
                                calc(
                                    18px +
                                    env(
                                        safe-area-inset-bottom,
                                        0px
                                    )
                                );

                            overflow-y: auto;
                            overscroll-behavior: contain;

                            z-index: 4200;

                            transform:
                                translateX(-104%);

                            transition:
                                transform
                                0.26s
                                cubic-bezier(
                                    0.2,
                                    0.8,
                                    0.2,
                                    1
                                );

                            box-shadow:
                                14px 0 38px
                                rgba(0, 0, 0, 0.24);
                        }

                        .sidebar.open {
                            transform: translateX(0);
                        }

                        .sidebar-inner {
                            position: static;
                        }

                        .sidebar-close {
                            display: inline-flex;
                        }

                        .sidebar-overlay {
                            display: block;

                            margin: 0;
                            padding: 0;

                            border: 0;

                            position: fixed;
                            inset: 0;

                            z-index: 4100;

                            background:
                                rgba(
                                    15,
                                    23,
                                    42,
                                    0.48
                                );

                            backdrop-filter:
                                blur(2px);

                            animation:
                                sidebarBackdropIn
                                0.2s ease;
                        }

                        .sidebar-link {
                            min-height: 44px;

                            font-size: 16px;
                        }
                    }
                `}
            </style>

            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    aria-label="Close navigation menu"
                />
            )}

            <aside
                className={`sidebar ${
                    sidebarOpen ? "open" : ""
                }`}
                aria-label="Main navigation"
            >
                <div className="sidebar-inner">
                    <div className="sidebar-brand-row">
                        <h2 className="sidebar-brand">
                            Task Manager
                        </h2>

                        <button
                            type="button"
                            className="sidebar-close"
                            onClick={() =>
                                setSidebarOpen(false)
                            }
                            aria-label="Close navigation menu"
                        >
                            ×
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        {navItems.map((item) => {
                            const isActive =
                                location.pathname ===
                                item.to;

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() =>
                                        setSidebarOpen(
                                            false
                                        )
                                    }
                                    className={`sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`}
                                    aria-current={
                                        isActive
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    <span className="sidebar-icon">
                                        {
                                            item.icon
                                        }
                                    </span>

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
