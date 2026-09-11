import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {

    // Public-page theme. Uses the same saved theme as the authenticated Layout.
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;

        localStorage.setItem(
            "theme",
            darkMode ? "dark" : "light"
        );

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
            darkMode ? "#4b5563" : "#e5e7eb"
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

        document.body.style.backgroundColor =
            darkMode ? "#111827" : "#f5f6f8";

        document.body.style.color =
            darkMode ? "#f9fafb" : "#111827";

        document.body.style.transition =
            "background-color 0.2s ease, color 0.2s ease";
    }, [darkMode]);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await API.post(
                "/auth/forgot-password",
                { email }
            );

            setMessage(
                res.data.message ||
                "If an account with that email exists, a password reset link has been sent."
            );

            setSubmitted(true);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">

            <button
                type="button"
                className="public-theme-toggle"
                onClick={() =>
                    setDarkMode((prev) => !prev)
                }
                aria-label={
                    darkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
                title={
                    darkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
            >
                <span className="public-theme-toggle-icon">
                    {darkMode ? "☀️" : "🌙"}
                </span>

                <span className="public-theme-toggle-text">
                    {darkMode ? "Light" : "Dark"}
                </span>
            </button>


            <div className="forgot-password-card">

                <div className="forgot-password-icon">
                    🔑
                </div>

                <h2>Forgot Password?</h2>

                <p className="forgot-password-subtitle">
                    Reset your Task Manager password
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>

                        <p className="forgot-password-description">
                            Enter your email address and we'll
                            send you a link to reset your password.
                        </p>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            className="forgot-password-input"
                        />

                        {error && (
                            <div className="forgot-message error-message">
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="forgot-password-button"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>

                    </form>
                ) : (
                    <div className="success-container">

                        <div className="success-icon">
                            📧
                        </div>

                        <div className="forgot-message success-message">
                            {message}
                        </div>

                        <p className="check-email-text">
                            Please check your inbox and follow
                            the link in the email to reset your
                            password.
                        </p>

                    </div>
                )}

                <p className="back-login-row">

                    <Link
                        to="/"
                        className="back-login-link"
                    >
                        ← Back to Login
                    </Link>

                </p>

            </div>

            <style>
                {`

                    /* =====================================================
                       LIGHT / DARK MODE TOGGLE
                    ===================================================== */

                    .public-theme-toggle {
                        position: fixed;
                        top: 18px;
                        right: 18px;
                        z-index: 1000;

                        min-width: 92px;
                        height: 40px;

                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 7px;

                        padding: 0 13px;

                        background:
                            var(--card-bg, #ffffff);

                        color:
                            var(--text-color, #111827);

                        border:
                            1px solid
                            var(--border-color, #e5e7eb);

                        border-radius: 999px;

                        box-shadow:
                            0 4px 14px
                            var(
                                --shadow-color,
                                rgba(0,0,0,0.1)
                            );

                        cursor: pointer;

                        font-family: inherit;
                        font-size: 13px;
                        font-weight: 700;

                        transition:
                            transform 0.16s ease,
                            box-shadow 0.16s ease,
                            background-color 0.2s ease,
                            color 0.2s ease,
                            border-color 0.2s ease;
                    }

                    .public-theme-toggle:hover {
                        transform: translateY(-2px);

                        box-shadow:
                            0 7px 18px
                            var(
                                --shadow-color,
                                rgba(0,0,0,0.14)
                            );
                    }

                    .public-theme-toggle:active {
                        transform:
                            translateY(0)
                            scale(0.97);
                    }

                    .public-theme-toggle-icon {
                        line-height: 1;
                        font-size: 16px;
                    }

                    .public-theme-toggle-text {
                        line-height: 1;
                    }

                    @media (max-width: 480px) {
                        .public-theme-toggle {
                            top: 12px;
                            right: 12px;
                            min-width: 82px;
                            height: 38px;
                            padding: 0 11px;
                        }
                    }


                    /* =====================================================
                       ANIMATIONS
                    ===================================================== */

                    @keyframes fadeSlideUp {
                        from {
                            opacity: 0;
                            transform: translateY(18px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes iconPop {
                        0% {
                            opacity: 0;
                            transform:
                                scale(0.6)
                                rotate(-10deg);
                        }

                        60% {
                            opacity: 1;
                            transform:
                                scale(1.1)
                                rotate(4deg);
                        }

                        100% {
                            opacity: 1;
                            transform:
                                scale(1)
                                rotate(0deg);
                        }
                    }

                    @keyframes successPop {
                        0% {
                            opacity: 0;
                            transform: scale(0.7);
                        }

                        70% {
                            opacity: 1;
                            transform: scale(1.08);
                        }

                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes messageSlide {
                        from {
                            opacity: 0;
                            transform: translateY(-5px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
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
                       PAGE
                    ===================================================== */

                    .forgot-password-page {
                        min-height: 100vh;
                        width: 100%;

                        display: flex;
                        align-items: center;
                        justify-content: center;

                        box-sizing: border-box;

                        padding: 20px;

                        background:
                            var(
                                --page-bg,
                                #f5f6f8
                            );
                    }

                    /* =====================================================
                       CARD
                    ===================================================== */

                    .forgot-password-card {
                        width: 100%;
                        max-width: 400px;

                        padding: 35px 30px;

                        border-radius: 16px;

                        background:
                            var(
                                --card-bg,
                                #ffffff
                            );

                        color:
                            var(
                                --text-color,
                                #111827
                            );

                        border:
                            1px solid
                            var(
                                --border-color,
                                #e5e7eb
                            );

                        box-shadow:
                            0 10px 30px
                            var(
                                --shadow-color,
                                rgba(0,0,0,0.1)
                            );

                        box-sizing: border-box;

                        text-align: center;

                        animation:
                            fadeSlideUp
                            0.4s
                            ease
                            both;
                    }

                    /* =====================================================
                       ICON
                    ===================================================== */

                    .forgot-password-icon {
                        font-size: 46px;

                        margin-bottom: 10px;

                        animation:
                            iconPop
                            0.5s
                            ease
                            both
                            0.1s;
                    }

                    /* =====================================================
                       TITLE
                    ===================================================== */

                    .forgot-password-card h2 {
                        margin:
                            0 0 6px;
                    }

                    .forgot-password-subtitle {
                        margin:
                            0 0 25px;

                        font-size: 14px;

                        opacity: 0.7;
                    }

                    /* =====================================================
                       DESCRIPTION
                    ===================================================== */

                    .forgot-password-description {
                        margin:
                            0 0 18px;

                        font-size: 14px;

                        line-height: 1.6;

                        opacity: 0.75;
                    }

                    /* =====================================================
                       INPUT
                    ===================================================== */

                    .forgot-password-input {
                        display: block;

                        width: 100%;

                        padding:
                            12px 14px;

                        margin:
                            10px 0;

                        box-sizing: border-box;

                        background:
                            var(
                                --input-bg,
                                #ffffff
                            );

                        color:
                            var(
                                --text-color,
                                #111827
                            );

                        border:
                            1px solid
                            var(
                                --input-border,
                                #ccc
                            );

                        border-radius: 8px;

                        font-size: 15px;

                        outline: none;

                        transition:
                            border-color 0.2s ease,
                            box-shadow 0.2s ease;
                    }

                    .forgot-password-input:focus {
                        border-color:
                            #60a5fa;

                        box-shadow:
                            0 0 0 3px
                            rgba(
                                96,
                                165,
                                250,
                                0.2
                            );
                    }

                    .forgot-password-input:hover {
                        border-color:
                            #9ca3af;
                    }

                    /* =====================================================
                       BUTTON
                    ===================================================== */

                    .forgot-password-button {
                        width: 100%;

                        padding: 12px;

                        margin-top: 18px;

                        cursor: pointer;

                        background:
                            #007bff;

                        color: white;

                        border: none;

                        border-radius: 8px;

                        font-size: 15px;

                        font-weight: 600;

                        display: flex;

                        align-items: center;

                        justify-content: center;

                        gap: 9px;

                        min-height: 44px;

                        transition:
                            transform 0.15s ease,
                            box-shadow 0.15s ease,
                            opacity 0.15s ease;
                    }

                    .forgot-password-button:hover:not(:disabled) {
                        transform:
                            translateY(-2px);

                        box-shadow:
                            0 6px 16px
                            rgba(
                                0,
                                123,
                                255,
                                0.35
                            );
                    }

                    .forgot-password-button:active:not(:disabled) {
                        transform:
                            translateY(0)
                            scale(0.98);
                    }

                    .forgot-password-button:disabled {
                        opacity: 0.75;

                        cursor: not-allowed;
                    }

                    /* =====================================================
                       SPINNER
                    ===================================================== */

                    .spinner {
                        width: 18px;

                        height: 18px;

                        border:
                            2.5px solid
                            rgba(
                                255,
                                255,
                                255,
                                0.4
                            );

                        border-top-color:
                            white;

                        border-radius: 50%;

                        animation:
                            spin
                            0.7s
                            linear
                            infinite;
                    }

                    /* =====================================================
                       MESSAGES
                    ===================================================== */

                    .forgot-message {
                        margin-top: 12px;

                        padding:
                            10px 12px;

                        border-radius: 8px;

                        font-size: 14px;

                        text-align: left;

                        line-height: 1.5;

                        animation:
                            messageSlide
                            0.25s
                            ease
                            both;

                        box-sizing: border-box;
                    }

                    .error-message {
                        color:
                            #dc2626;

                        background:
                            rgba(
                                239,
                                68,
                                68,
                                0.1
                            );

                        border:
                            1px solid
                            rgba(
                                239,
                                68,
                                68,
                                0.25
                            );
                    }

                    .success-message {
                        color:
                            #16a34a;

                        background:
                            rgba(
                                34,
                                197,
                                94,
                                0.1
                            );

                        border:
                            1px solid
                            rgba(
                                34,
                                197,
                                94,
                                0.25
                            );
                    }

                    /* =====================================================
                       SUCCESS
                    ===================================================== */

                    .success-container {
                        animation:
                            messageSlide
                            0.3s
                            ease
                            both;
                    }

                    .success-icon {
                        font-size: 42px;

                        margin:
                            5px 0 12px;

                        animation:
                            successPop
                            0.45s
                            ease
                            both;
                    }

                    .check-email-text {
                        margin:
                            14px 0 0;

                        font-size: 14px;

                        line-height: 1.6;

                        opacity: 0.7;
                    }

                    /* =====================================================
                       BACK TO LOGIN
                    ===================================================== */

                    .back-login-row {
                        margin-top: 24px;

                        font-size: 14px;

                        text-align: center;
                    }

                    .back-login-link {
                        color:
                            #007bff;

                        text-decoration: none;

                        font-weight: 600;

                        transition:
                            opacity 0.15s ease;
                    }

                    .back-login-link:hover {
                        opacity: 0.7;

                        text-decoration: underline;
                    }

                    /* =====================================================
                       MOBILE
                    ===================================================== */

                    @media (max-width: 480px) {

                        .forgot-password-page {
                            padding: 15px;
                        }

                        .forgot-password-card {
                            padding:
                                30px 20px;

                            border-radius:
                                14px;
                        }

                        .forgot-password-icon {
                            font-size: 42px;
                        }

                        .forgot-password-card h2 {
                            font-size: 23px;
                        }

                    }

                `}
            </style>

        </div>
    );
}

export default ForgotPassword;