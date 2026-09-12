import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIAssistant from "./AIAssistant";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        const theme = darkMode ? "dark" : "light";

        localStorage.setItem("theme", theme);

        root.dataset.theme = theme;
        body.dataset.theme = theme;

        root.style.colorScheme =
            darkMode ? "dark" : "only light";

        root.style.setProperty(
            "--page-bg",
            darkMode ? "#111827" : "#f5f6f8"
        );

        root.style.setProperty(
            "--bg-color",
            darkMode ? "#111827" : "#f5f6f8"
        );

        root.style.setProperty(
            "--card-bg",
            darkMode ? "#1f2937" : "#ffffff"
        );

        root.style.setProperty(
            "--section-bg",
            darkMode ? "#374151" : "#f7f7f7"
        );

        root.style.setProperty(
            "--input-bg",
            darkMode ? "#374151" : "#ffffff"
        );

        root.style.setProperty(
            "--text-color",
            darkMode ? "#f9fafb" : "#111827"
        );

        root.style.setProperty(
            "--secondary-text",
            darkMode ? "#d1d5db" : "#444444"
        );

        root.style.setProperty(
            "--muted-text",
            darkMode ? "#9ca3af" : "#777777"
        );

        root.style.setProperty(
            "--border-color",
            darkMode ? "#4b5563" : "#dddddd"
        );

        root.style.setProperty(
            "--input-border",
            darkMode ? "#6b7280" : "#cccccc"
        );

        root.style.setProperty(
            "--hover-bg",
            darkMode ? "#374151" : "#f3f4f6"
        );

        root.style.setProperty(
            "--shadow-color",
            darkMode
                ? "rgba(0,0,0,0.35)"
                : "rgba(0,0,0,0.1)"
        );

        body.style.backgroundColor =
            darkMode ? "#111827" : "#f5f6f8";

        body.style.color =
            darkMode ? "#f9fafb" : "#111827";

        body.style.transition =
            "background-color 0.2s ease, color 0.2s ease";
    }, [darkMode]);

    return (
        <>
            <style>
                {`
                    html,
                    body,
                    #root {
                        width: 100%;
                        min-height: 100%;
                        margin: 0;
                    }

                    html,
                    body {
                        overflow-x: hidden;
                        background: var(--bg-color);
                    }

                    .app-shell {
                        display: flex;
                        width: 100%;
                        min-height: 100vh;
                        min-height: 100dvh;
                        background: var(--bg-color);
                        color: var(--text-color);
                        transition:
                            background-color 0.2s ease,
                            color 0.2s ease;
                    }

                    .app-content {
                        flex: 1;
                        min-width: 0;
                        width: calc(100% - 220px);
                    }

                    .app-main {
                        width: 100%;
                        min-width: 0;
                        min-height: calc(100vh - 70px);
                        min-height: calc(100dvh - 70px);
                        padding: 30px;
                        box-sizing: border-box;
                        background: var(--bg-color);
                        color: var(--text-color);
                        overflow-x: hidden;
                        transition:
                            background-color 0.2s ease,
                            color 0.2s ease;
                    }

                    @media (max-width: 768px) {
                        .app-content {
                            width: 100%;
                        }

                        .app-main {
                            min-height: calc(100vh - 64px);
                            min-height: calc(100dvh - 64px);
                            padding: 18px 14px 90px;
                        }
                    }

                    @media (max-width: 480px) {
                        .app-main {
                            padding: 16px 12px 90px;
                        }
                    }
                `}
            </style>

            <div className="app-shell">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                />

                <div className="app-content">
                    <Navbar
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                    />

                    <main className="app-main">
                        {children}
                    </main>
                </div>

                <AIAssistant />
            </div>
        </>
    );
}

export default Layout;
