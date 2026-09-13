import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { applyTheme, getStoredTheme } from "../utils/theme";

function Login() {

    // Uses the same saved theme as the authenticated application.
    const [darkMode, setDarkMode] = useState(
        () => getStoredTheme() === "dark"
    );

    useEffect(() => {
        applyTheme(darkMode);
    }, [darkMode]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
        const res = await API.post("/auth/login", {
            email,
            password,
        });

       login(
    res.data.token,
    res.data.user
);

toast.success(
    res.data.user?.role === "admin"
        ? "👑 Admin login successful. Welcome back!"
        : "Logged in successfully. Welcome back!"
);

navigate("/dashboard");
    } catch (err) {
        console.log(
            err.response?.data ||
            err.message
        );

        toast.error(
            err.response?.data?.message ||
            "Login failed. Please check your email and password."
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-page">

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

            <div className="login-card">
                <div className="login-icon">🔐</div>

                <h2>Welcome Back</h2>
                <p className="login-subtitle">
                    Log in to continue to Task Manager
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />

                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
                            style={{ paddingRight: "40px" }}
                        />

                        <span
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="eye-icon"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>

                    <div className="forgot-row">
                        <Link to="/forgot-password" className="link-muted">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? (
                            <span className="spinner" />
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="register-row">
                    Don't have an account?{" "}
                    <Link to="/register" className="link-bold">
                        Register
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
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .login-page {
                        min-height: 100vh;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                        padding: 20px;
                        background: var(--page-bg, #ffffff);
                    }

                    .login-card {
                        width: 100%;
                        max-width: 400px;
                        padding: 35px 30px;
                        border-radius: 16px;

                        background: var(--card-bg, #ffffff);
                        color: var(--text-color, #111827);
                        border: 1px solid var(--border-color, #e5e7eb);
                        box-shadow: 0 10px 30px var(--shadow-color, rgba(0,0,0,0.1));

                        box-sizing: border-box;
                        text-align: center;

                        animation: fadeSlideUp 0.4s ease both;
                    }

                    .login-icon {
                        font-size: 46px;
                        margin-bottom: 10px;
                        animation: iconPop 0.5s ease both 0.1s;
                    }

                    .login-card h2 {
                        margin: 0 0 6px;
                    }

                    .login-subtitle {
                        margin: 0 0 25px;
                        font-size: 14px;
                        opacity: 0.7;
                    }

                    .login-input {
                        display: block;
                        width: 100%;
                        padding: 12px 14px;
                        margin: 10px 0;
                        box-sizing: border-box;

                        background: var(--input-bg, #ffffff);
                        color: var(--text-color, #111827);
                        border: 1px solid var(--input-border, #ccc);
                        border-radius: 8px;

                        font-size: 15px;
                        outline: none;

                        transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    }

                    .login-input:focus {
                        border-color: #60a5fa;
                        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
                    }

                    .password-field {
                        position: relative;
                    }

                    .eye-icon {
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        user-select: none;
                        font-size: 16px;
                        transition: transform 0.15s ease;
                    }

                    .eye-icon:hover {
                        transform: translateY(-50%) scale(1.15);
                    }

                    .forgot-row {
                        text-align: right;
                        margin: 6px 0 18px;
                    }

                    .link-muted {
                        font-size: 14px;
                        color: #007bff;
                        text-decoration: none;
                        transition: opacity 0.15s ease;
                    }

                    .link-muted:hover {
                        opacity: 0.7;
                        text-decoration: underline;
                    }

                    .link-bold {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                        transition: opacity 0.15s ease;
                    }

                    .link-bold:hover {
                        opacity: 0.7;
                        text-decoration: underline;
                    }

                    .login-button {
                        width: 100%;
                        padding: 12px;
                        margin-top: 5px;
                        cursor: pointer;

                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 8px;

                        font-size: 15px;
                        font-weight: 600;

                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 44px;

                        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
                    }

                    .login-button:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(0, 123, 255, 0.35);
                    }

                    .login-button:active:not(:disabled) {
                        transform: translateY(0) scale(0.98);
                    }

                    .login-button:disabled {
                        opacity: 0.75;
                        cursor: not-allowed;
                    }

                    .spinner {
                        width: 18px;
                        height: 18px;
                        border: 2.5px solid rgba(255, 255, 255, 0.4);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 0.7s linear infinite;
                    }

                    .register-row {
                        text-align: center;
                        margin-top: 22px;
                        font-size: 14px;
                    }
                `}
            </style>
        </div>
    );
}

export default Login;