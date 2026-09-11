import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIAssistant from "./AIAssistant";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Load saved theme
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    // Apply global theme
    useEffect(() => {
        const root = document.documentElement;

        localStorage.setItem(
            "theme",
            darkMode ? "dark" : "light"
        );

        // Theme variables
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

        // Body
        document.body.style.backgroundColor =
            darkMode ? "#111827" : "#f5f6f8";

        document.body.style.color =
            darkMode ? "#f9fafb" : "#111827";

        document.body.style.transition =
            "background-color 0.2s ease, color 0.2s ease";
    }, [darkMode]);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                transition:
                    "background-color 0.2s ease, color 0.2s ease",
            }}
        >
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                darkMode={darkMode}
            />

            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <Navbar
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />

                <main
                    style={{
                        padding: "30px",
                        width: "100%",
                        boxSizing: "border-box",
                        backgroundColor:
                            "var(--bg-color)",
                        color: "var(--text-color)",
                        minHeight:
                            "calc(100vh - 70px)",
                        transition:
                            "background-color 0.2s ease, color 0.2s ease",
                    }}
                >
                    {children}
                </main>
            </div>

            {/* Global authenticated AI assistant.
                Every page that uses Layout gets it automatically. */}
            <AIAssistant />
        </div>
    );
}

export default Layout;
