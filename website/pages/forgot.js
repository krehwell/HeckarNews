import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import requestPasswordResetLink from "../api/users/requestPasswordResetLink.js";

export default function Forgot() {
    const [state, setState] = useState({
        usernameInputValue: "",
        noEmailError: false,
        userNotFoundError: false,
        submitError: false,
        loading: false,
        success: false,
    });

    const updateUsernameInputValue = (event) => {
        setState({ usernameInputValue: event.target.value });
    };

    const submitRequest = () => {
        if (state.loading) return;

        if (!state.usernameInputValue) {
            setState({ ...state, userNotFoundError: true });
        } else {
            setState({ loading: true });

            requestPasswordResetLink(state.usernameInputValue, (response) => {
                if (response.userNotFoundError) {
                    setState({
                        ...state,
                        loading: false,
                        noEmailError: false,
                        userNotFoundError: true,
                        submitError: false,
                    });
                } else if (response.noEmailError) {
                    setState({
                        ...state,
                        loading: false,
                        noEmailError: true,
                        userNotFoundError: false,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setState({
                        ...state,
                        loading: false,
                        noEmailError: false,
                        userNotFoundError: false,
                        submitError: true,
                    });
                } else {
                    setState({
                        ...state,
                        loading: false,
                        success: true,
                        noEmailError: false,
                        userNotFoundError: false,
                        submitError: false,
                    });
                }
            });
        }
    };

    return (
        <div className="forgot-wrapper layout-wrapper">
            <HeadMetadata title="Forgot Password | HeckarNews" />
            <AlternateHeader displayMessage="Reset Password" />
            {state.success ? (
                <div className="forgot-success-msg">
                    <span>
                        Password recovery message sent. If you do not see it,
                        you may want to check your spam folder.
                    </span>
                </div>
            ) : (
                <>
                    {state.noEmailError ? (
                        <div className="forgot-error-msg">
                            <span>No valid email address in profile.</span>
                        </div>
                    ) : null}
                    {state.userNotFoundError ? (
                        <div className="forgot-error-msg">
                            <span>User not found.</span>
                        </div>
                    ) : null}
                    {state.submitError ? (
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
                            <input
                                type="text"
                                value={state.usernameInputValue}
                                onChange={updateUsernameInputValue}
                            />
                        </div>
                        <div className="forgot-submit-btn">
                            <input
                                type="submit"
                                value="Send reset email"
                                onClick={() => submitRequest()}
                            />
                            {state.loading && <span> loading...</span>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
