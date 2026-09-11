import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {

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

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await API.post("/auth/register", {
                name,
                email,
                password
            });

            setMessage(
                res.data.message ||
                "Registration successful. Please check your email."
            );

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

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


            <div className="register-card">

                <div className="register-icon">
                    👤
                </div>

                <h2>Create Account</h2>

                <p className="register-subtitle">
                    Create your Task Manager account
                </p>

                <form onSubmit={handleRegister}>

                    {/* Name */}

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                        className="register-input"
                    />

                    {/* Email */}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        className="register-input"
                    />

                    {/* Password */}

                    <div className="password-field">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            className="register-input"
                            style={{
                                paddingRight: "40px"
                            }}
                        />

                        <span
                            onClick={() =>
                                setShowPassword(
                                    (prev) => !prev
                                )
                            }
                            className="eye-icon"
                            title={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword
                                ? "🙈"
                                : "👁️"}
                        </span>

                    </div>

                    {/* Confirm Password */}

                    <div className="password-field">

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                            className="register-input"
                            style={{
                                paddingRight: "40px"
                            }}
                        />

                        <span
                            onClick={() =>
                                setShowConfirmPassword(
                                    (prev) => !prev
                                )
                            }
                            className="eye-icon"
                            title={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showConfirmPassword
                                ? "🙈"
                                : "👁️"}
                        </span>

                    </div>

                    {/* Error */}

                    {error && (
                        <div className="register-message error-message">
                            ❌ {error}
                        </div>
                    )}

                    {/* Success */}

                    {message && (
                        <div className="register-message success-message">
                            ✅ {message}
                        </div>
                    )}

                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="register-button"
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                </form>

                {/* Login */}

                <p className="login-row">
                    Already have an account?{" "}

                    <Link
                        to="/"
                        className="link-bold"
                    >
                        Login
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
                            transform: scale(0.6) rotate(-10deg);
                        }

                        60% {
                            opacity: 1;
                            transform: scale(1.1) rotate(4deg);
                        }

                        100% {
                            opacity: 1;
                            transform: scale(1) rotate(0deg);
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

                    /* =====================================================
                       PAGE
                    ===================================================== */

                    .register-page {
                        min-height: 100vh;
                        width: 100%;

                        display: flex;
                        align-items: center;
                        justify-content: center;

                        box-sizing: border-box;

                        padding: 20px;

                        background:
                            var(--page-bg, #f5f6f8);
                    }

                    /* =====================================================
                       CARD
                    ===================================================== */

                    .register-card {
                        width: 100%;
                        max-width: 400px;

                        padding: 35px 30px;

                        border-radius: 16px;

                        background:
                            var(--card-bg, #ffffff);

                        color:
                            var(--text-color, #111827);

                        border:
                            1px solid
                            var(--border-color, #e5e7eb);

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

                    .register-icon {
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

                    .register-card h2 {
                        margin:
                            0 0 6px;
                    }

                    .register-subtitle {
                        margin:
                            0 0 25px;

                        font-size: 14px;

                        opacity: 0.7;
                    }

                    /* =====================================================
                       INPUTS
                    ===================================================== */

                    .register-input {
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
                            box-shadow 0.2s ease,
                            transform 0.15s ease;
                    }

                    .register-input:focus {
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

                    .register-input:hover {
                        border-color:
                            #9ca3af;
                    }

                    /* =====================================================
                       PASSWORD
                    ===================================================== */

                    .password-field {
                        position: relative;
                    }

                    .eye-icon {
                        position: absolute;

                        right: 12px;

                        top: 50%;

                        transform:
                            translateY(-50%);

                        cursor: pointer;

                        user-select: none;

                        font-size: 16px;

                        transition:
                            transform 0.15s ease;
                    }

                    .eye-icon:hover {
                        transform:
                            translateY(-50%)
                            scale(1.15);
                    }

                    /* =====================================================
                       MESSAGES
                    ===================================================== */

                    .register-message {
                        margin-top: 12px;

                        padding:
                            10px 12px;

                        border-radius: 8px;

                        font-size: 14px;

                        text-align: left;

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
                       BUTTON
                    ===================================================== */

                    .register-button {
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

                    .register-button:hover:not(:disabled) {
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

                    .register-button:active:not(:disabled) {
                        transform:
                            translateY(0)
                            scale(0.98);
                    }

                    .register-button:disabled {
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
                       LOGIN LINK
                    ===================================================== */

                    .login-row {
                        text-align: center;

                        margin-top: 22px;

                        font-size: 14px;
                    }

                    .link-bold {
                        color:
                            #007bff;

                        text-decoration: none;

                        font-weight: bold;

                        transition:
                            opacity 0.15s ease;
                    }

                    .link-bold:hover {
                        opacity: 0.7;

                        text-decoration: underline;
                    }

                    /* =====================================================
                       MOBILE
                    ===================================================== */

                    @media (max-width: 480px) {

                        .register-page {
                            padding: 15px;
                        }

                        .register-card {
                            padding:
                                30px 20px;

                            border-radius:
                                14px;
                        }

                        .register-icon {
                            font-size: 42px;
                        }

                        .register-card h2 {
                            font-size: 23px;
                        }

                    }

                `}
            </style>

        </div>
    );
}

export default Register;