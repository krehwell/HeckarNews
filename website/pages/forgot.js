import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import requestPasswordResetLink from "../api/users/requestPasswordResetLink.js";

export default function Forgot() {
    const [usernameInputValue, setUsernameInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState({
        noEmailError: false,
        userNotFoundError: false,
        submitError: false,
    });

    const updateUsernameInputValue = (event) => {
        setUsernameInputValue(event.target.value);
    };

    const submitRequest = () => {
        if (loading) return;

        if (!usernameInputValue) {
            setError({ ...error, userNotFoundError: true });
        } else {
            setLoading(true);

            requestPasswordResetLink(usernameInputValue, (response) => {
                setLoading(false);
                // console.log(response);
                if (response.userNotFoundError) {
                    setError({
                        ...error,
                        noEmailError: false,
                        userNotFoundError: true,
                        submitError: false,
                    });
                } else if (response.noEmailError) {
                    setError({
                        ...error,
                        noEmailError: true,
                        userNotFoundError: false,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        ...error,
                        noEmailError: false,
                        userNotFoundError: false,
                        submitError: true,
                    });
                } else {
                    setError({
                        ...error,
                        noEmailError: false,
                        userNotFoundError: false,
                        submitError: false,
                    });
                    setSuccess(true);
                }
            });
        }
    };

    return (
        <div className="forgot-wrapper layout-wrapper">
            <HeadMetadata title="Forgot Password | HeckarNews" />
            <AlternateHeader displayMessage="Reset Password" />
            {success ? (
                <div className="forgot-success-msg">
                    <span>
                        Password recovery message sent. If you do not see it, you may want to check your spam folder.
                    </span>
                </div>
            ) : (
                <>
                    {error.noEmailError ? (
                        <div className="forgot-error-msg">
                            <span>No valid email address in profile.</span>
                        </div>
                    ) : null}
                    {error.userNotFoundError ? (
                        <div className="forgot-error-msg">
                            <span>User not found.</span>
                        </div>
                    ) : null}
                    {error.submitError ? (
                        <div className="forgot-error-msg">
                            <span>An error occurred.</span>
                        </div>
                    ) : null}
                    <div className="forgot-header">
                        <span>Reset your password</span>
                    </div>
                    <div className="forgot-input-item">
                        <div className="forgot-input-item-label">
                            <span>username:</span>
                        </div>
                        <div className="forgot-input-item-input">
                            <input type="text" value={usernameInputValue} onChange={updateUsernameInputValue} />
                        </div>
                        <div className="forgot-submit-btn">
                            <input type="submit" value="Send reset email" onClick={() => submitRequest()} />
                            {loading && <span> loading...</span>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
