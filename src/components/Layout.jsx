import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIAssistant from "./AIAssistant";
import {
    applyTheme,
    getStoredTheme,
} from "../utils/theme";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [darkMode, setDarkMode] = useState(
        () => getStoredTheme() === "dark"
    );

    useEffect(() => {
        applyTheme(darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [sidebarOpen]);

    return (
        <>
            <style>
                {`
                    .app-shell {
                        display: flex;
                        align-items: stretch;

                        width: 100%;
                        min-width: 0;
                        min-height: 100vh;
                        min-height: 100dvh;

                        background: var(--bg-color);
                        color: var(--text-color);

                        transition:
                            background-color 0.2s ease,
                            color 0.2s ease;
                    }

                    .app-content {
                        flex: 1 1 auto;
                        min-width: 0;
                        width: 100%;

                        display: flex;
                        flex-direction: column;

                        background: var(--bg-color);
                    }

                    .app-main {
                        flex: 1 1 auto;

                        width: 100%;
                        min-width: 0;
                        min-height: calc(100vh - 70px);
                        min-height: calc(100dvh - 70px);

                        padding:
                            clamp(22px, 2.2vw, 34px)
                            clamp(20px, 2.5vw, 38px)
                            48px;

                        box-sizing: border-box;

                        background: var(--bg-color);
                        color: var(--text-color);

                        overflow-x: clip;

                        transition:
                            background-color 0.2s ease,
                            color 0.2s ease;
                    }

                    .app-main-inner {
                        width: 100%;
                        min-width: 0;
                        max-width: 1440px;
                        margin: 0 auto;
                    }

                    @media (max-width: 768px) {
                        .app-shell {
                            display: block;
                        }

                        .app-content {
                            width: 100%;
                        }

                        .app-main {
                            min-height:
                                calc(
                                    100vh -
                                    64px -
                                    env(
                                        safe-area-inset-top,
                                        0px
                                    )
                                );

                            min-height:
                                calc(
                                    100dvh -
                                    64px -
                                    env(
                                        safe-area-inset-top,
                                        0px
                                    )
                                );

                            padding:
                                20px
                                14px
                                calc(
                                    96px +
                                    env(
                                        safe-area-inset-bottom,
                                        0px
                                    )
                                );

                            overflow-x: hidden;
                        }

                        .app-main-inner {
                            max-width: none;
                        }
                    }

                    @media (max-width: 480px) {
                        .app-main {
                            padding-left: 12px;
                            padding-right: 12px;
                        }
                    }
                `}
            </style>

            <div className="app-shell">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="app-content">
                    <Navbar
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                    />

                    <main className="app-main">
                        <div className="app-main-inner">
                            {children}
                        </div>
                    </main>
                </div>

                <AIAssistant />
            </div>
        </>
    );
}

export default Layout;
