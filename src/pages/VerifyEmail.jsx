import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    const hasRun = useRef(false);

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
        } else {
            setMessage(
                "Invalid verification link."
            );
            setLoading(false);
        }
    }, [token]);

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: "400px",
                    margin: "100px auto",
                    textAlign: "center"
                }}
            >
                <h2>Verifying your email...</h2>

                <p>
                    Please wait while we verify
                    your email address.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "100px auto",
                padding: "30px",
                textAlign: "center"
            }}
        >

            {success ? (
                <>
                    <h2>
                        ✅ Email Verified!
                    </h2>

                    <p>
                        {message}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/")
                        }
                        style={{
                            padding: "10px 20px",
                            marginTop: "15px",
                            cursor: "pointer"
                        }}
                    >
                        Go to Login
                    </button>
                </>
            ) : (
                <>
                    <h2>
                        ❌ Verification Failed
                    </h2>

                    <p>
                        {message}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/")
                        }
                        style={{
                            padding: "10px 20px",
                            marginTop: "15px",
                            cursor: "pointer"
                        }}
                    >
                        Go to Login
                    </button>
                </>
            )}

        </div>
    );
}

export default VerifyEmail;