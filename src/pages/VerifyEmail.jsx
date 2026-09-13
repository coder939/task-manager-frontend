import {
    useEffect,
    useRef,
    useState,
} from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
import API from "../services/api";
import {
    applyTheme,
    getStoredTheme,
} from "../utils/theme";

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(
        () => getStoredTheme() === "dark"
    );

    const [loading, setLoading] =
        useState(true);

    const [success, setSuccess] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const hasRun = useRef(false);

    useEffect(() => {
        applyTheme(darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (hasRun.current) return;

        hasRun.current = true;

        const verifyEmail = async () => {
            try {
                const res = await API.get(
                    `/auth/verify-email/${token}`
                );

                setSuccess(true);

                setMessage(
                    res.data.message ||
                        "Email verified successfully."
                );
            } catch (err) {
                setSuccess(false);

                setMessage(
                    err.response?.data?.message ||
                        "Email verification failed."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    const verificationLoading =
        Boolean(token) && loading;

    const verificationSuccess =
        Boolean(token) && success;

    const verificationMessage =
        token
            ? message
            : "Invalid verification link.";

    return (
        <>
            <style>
                {`
                    .verify-email-page {
                        min-height: 100vh;
                        min-height: 100dvh;
                        width: 100%;

                        display: grid;
                        place-items: center;

                        padding:
                            84px
                            20px
                            32px;

                        box-sizing: border-box;

                        background:
                            var(--page-bg);

                        color:
                            var(--text-color);
                    }

                    .verify-email-card {
                        width: 100%;
                        max-width: 430px;

                        padding: 34px 30px;

                        background:
                            var(--card-bg);

                        color:
                            var(--text-color);

                        border:
                            1px solid
                            var(--border-color);

                        border-radius: 18px;

                        box-shadow:
                            0 16px 42px
                            var(--shadow-color);

                        text-align: center;
                    }

                    .verify-email-icon {
                        width: 62px;
                        height: 62px;

                        display: grid;
                        place-items: center;

                        margin:
                            0
                            auto
                            18px;

                        border-radius: 18px;

                        background:
                            var(--section-bg);

                        font-size: 31px;
                    }

                    .verify-email-card h2 {
                        margin:
                            0
                            0
                            10px;

                        font-size:
                            clamp(
                                23px,
                                5vw,
                                28px
                            );

                        line-height: 1.2;
                    }

                    .verify-email-card p {
                        margin:
                            0
                            0
                            22px;

                        color:
                            var(--secondary-text);

                        line-height: 1.6;
                    }

                    .verify-email-button {
                        width: 100%;
                        min-height: 44px;

                        padding:
                            10px
                            18px;

                        border: 0;
                        border-radius: 10px;

                        background: #2563eb;
                        color: #ffffff;

                        font-weight: 700;

                        cursor: pointer;

                        transition:
                            transform 0.15s ease,
                            box-shadow 0.15s ease;
                    }

                    .verify-email-button:hover {
                        transform:
                            translateY(-1px);

                        box-shadow:
                            0 8px 18px
                            rgba(
                                37,
                                99,
                                235,
                                0.22
                            );
                    }

                    .verify-email-loader {
                        width: 36px;
                        height: 36px;

                        margin:
                            4px
                            auto
                            20px;

                        border:
                            3px solid
                            var(--border-color);

                        border-top-color:
                            #2563eb;

                        border-radius: 50%;

                        animation:
                            verifySpin
                            0.8s
                            linear
                            infinite;
                    }

                    .verify-email-theme-toggle {
                        position: fixed;
                        top:
                            calc(
                                16px +
                                env(
                                    safe-area-inset-top,
                                    0px
                                )
                            );
                        right: 16px;
                        z-index: 10;

                        min-height: 40px;

                        display:
                            inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 7px;

                        padding:
                            0
                            13px;

                        border:
                            1px solid
                            var(--border-color);

                        border-radius: 999px;

                        background:
                            var(--card-bg);

                        color:
                            var(--text-color);

                        box-shadow:
                            0 4px 14px
                            var(--shadow-color);

                        font-weight: 700;
                        font-size: 13px;

                        cursor: pointer;
                    }

                    @keyframes verifySpin {
                        to {
                            transform:
                                rotate(360deg);
                        }
                    }

                    @media (max-width: 480px) {
                        .verify-email-page {
                            align-items: start;

                            padding:
                                calc(
                                    76px +
                                    env(
                                        safe-area-inset-top,
                                        0px
                                    )
                                )
                                14px
                                24px;
                        }

                        .verify-email-card {
                            padding:
                                28px
                                20px;

                            border-radius: 15px;
                        }

                        .verify-email-theme-toggle {
                            right: 12px;
                        }
                    }
                `}
            </style>

            <button
                type="button"
                className="verify-email-theme-toggle"
                onClick={() =>
                    setDarkMode(
                        (previous) => !previous
                    )
                }
                aria-label={
                    darkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
            >
                <span aria-hidden="true">
                    {darkMode
                        ? "☀️"
                        : "🌙"}
                </span>

                <span>
                    {darkMode
                        ? "Light"
                        : "Dark"}
                </span>
            </button>

            <main className="verify-email-page">
                <section className="verify-email-card">
                    {verificationLoading ? (
                        <>
                            <div
                                className="verify-email-loader"
                                aria-hidden="true"
                            />

                            <h2>
                                Verifying your email
                            </h2>

                            <p>
                                Please wait while
                                we confirm your
                                email address.
                            </p>
                        </>
                    ) : (
                        <>
                            <div
                                className="verify-email-icon"
                                aria-hidden="true"
                            >
                                {verificationSuccess
                                    ? "✅"
                                    : "❌"}
                            </div>

                            <h2>
                                {verificationSuccess
                                    ? "Email Verified"
                                    : "Verification Failed"}
                            </h2>

                            <p>
                                {
                                    verificationMessage
                                }
                            </p>

                            <button
                                type="button"
                                className="verify-email-button"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Go to Login
                            </button>
                        </>
                    )}
                </section>
            </main>
        </>
    );
}

export default VerifyEmail;
