import { useState } from "react";
import Router from "next/router";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import resetPassword from "../api/users/resetPassword.js";

export default function Reset({ resetToken, username }) {
    const [passwordInputValue, setPasswordInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        passwordLengthError: false,
        expiredTokenError: false,
        invalidTokenError: false,
        submitError: false,
    });

    const updatePasswordInputValue = (event) => {
        setPasswordInputValue(event.target.value);
    };

    const submitRequest = () => {
        if (loading) return;

        if (passwordInputValue.length < 8) {
            setError({
                passwordLengthError: true,
                expiredTokenError: false,
                invalidTokenError: false,
                submitError: false,
            });
        } else {
            setLoading(true);

            resetPassword(username, passwordInputValue, resetToken, (response) => {
                setLoading(false);
                if (response.invalidTokenError) {
                    setError({
                        ...error,
                        passwordLengthError: false,
                        expiredTokenError: false,
                        invalidTokenError: true,
                        submitError: false,
                    });
                } else if (response.expiredTokenError) {
                    setError({
                        ...error,
                        passwordLengthError: false,
                        expiredTokenError: true,
                        invalidTokenError: false,
                        submitError: false,
                    });
                } else if (response.passwordLengthError) {
                    setError({
                        ...error,
                        passwordLengthError: true,
                        expiredTokenError: false,
                        invalidTokenError: false,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        ...error,
                        passwordLengthError: false,
                        expiredTokenError: false,
                        invalidTokenError: false,
                        submitError: true,
                    });
                } else {
                    // location.href = "/login";
                    Router.push("/login");
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Reset Password | HeckarNews" />
            <AlternateHeader displayMessage="Reset Password" />
            <div className="reset-password-content-container">
                {error.passwordLengthError ? (
                    <div className="reset-password-error-msg">
                        <span>Passwords should be at least 8 characters.</span>
                    </div>
                ) : null}
                {error.expiredTokenError ? (
                    <div className="reset-password-error-msg">
                        <span>Reset token has expired.</span>
                    </div>
                ) : null}
                {error.invalidTokenError ? (
                    <div className="reset-password-error-msg">
                        <span>Reset token is invalid.</span>
                    </div>
                ) : null}
                {error.submitError ? (
                    <div className="reset-password-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}
                <div className="reset-password-input-item">
                    <div className="reset-password-input-item-label">
                        <span>New Password:</span>
                    </div>
                    <div className="reset-password-input-item-input">
                        <input type="password" value={passwordInputValue} onChange={updatePasswordInputValue} />
                    </div>
                </div>
                <div className="reset-password-submit-btn">
                    <input type="submit" value="Change" onClick={() => submitRequest()} />
                    {loading && <span> loading...</span>}
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ query }) {
    return {
        props: {
            resetToken: query.token,
            username: query.username,
        },
    };
}
