import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import resetPassword from "../api/users/resetPassword.js";

export default function Reset({ resetToken, username }) {
    const [state, setState] = useState({
        passwordInputValue: "",
        passwordLengthError: false,
        expiredTokenError: false,
        invalidTokenError: false,
        submitError: false,
    });

    const updatePasswordInputValue = (event) => {
        setState({ passwordInputValue: event.target.value });
    };

    const submitRequest = () => {
        if (state.loading) return;

        if (state.passwordInputValue.length < 8) {
            setState({
                ...state,
                passwordLengthError: true,
                expiredTokenError: false,
                invalidTokenError: false,
                submitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            resetPassword(
                username,
                state.passwordInputValue,
                resetToken,
                (response) => {
                    if (response.invalidTokenError) {
                        setState({
                            ...state,
                            loading: false,
                            passwordLengthError: false,
                            expiredTokenError: false,
                            invalidTokenError: true,
                            submitError: false,
                        });
                    } else if (response.expiredTokenError) {
                        setState({
                            ...state,
                            loading: false,
                            passwordLengthError: false,
                            expiredTokenError: true,
                            invalidTokenError: false,
                            submitError: false,
                        });
                    } else if (response.passwordLengthError) {
                        setState({
                            ...state,
                            loading: false,
                            passwordLengthError: true,
                            expiredTokenError: false,
                            invalidTokenError: false,
                            submitError: false,
                        });
                    } else if (response.submitError || !response.success) {
                        setState({
                            ...state,
                            loading: false,
                            passwordLengthError: false,
                            expiredTokenError: false,
                            invalidTokenError: false,
                            submitError: true,
                        });
                    } else {
                        window.location.href = "/login";
                    }
                }
            );
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Reset Password | HeckarNews" />
            <AlternateHeader displayMessage="Reset Password" />
            <div className="reset-password-content-container">
                {state.passwordLengthError ? (
                    <div className="reset-password-error-msg">
                        <span>Passwords should be at least 8 characters.</span>
                    </div>
                ) : null}
                {state.expiredTokenError ? (
                    <div className="reset-password-error-msg">
                        <span>Reset token has expired.</span>
                    </div>
                ) : null}
                {state.invalidTokenError ? (
                    <div className="reset-password-error-msg">
                        <span>Reset token is invalid.</span>
                    </div>
                ) : null}
                {state.submitError ? (
                    <div className="reset-password-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}
                <div className="reset-password-input-item">
                    <div className="reset-password-input-item-label">
                        <span>New Password:</span>
                    </div>
                    <div className="reset-password-input-item-input">
                        <input
                            type="password"
                            value={state.passwordInputValue}
                            onChange={updatePasswordInputValue}
                        />
                    </div>
                </div>
                <div className="reset-password-submit-btn">
                    <input
                        type="submit"
                        value="Change"
                        onClick={() => submitRequest()}
                    />
                    {state.loading && <span> loading...</span>}
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
