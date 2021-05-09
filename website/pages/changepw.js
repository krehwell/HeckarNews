import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../api/users/authUser.js";
import changePassword from "../api/users/changePassword.js";

export default function ChangePw({ userContainsEmail, username }) {
    const [state, setState] = useState({
        currentInputValue: "",
        newInputValue: "",
        loading: false,
        invalidCurrentPassword: false,
        newPasswordLengthError: false,
        submitError: false,
    });

    const updateCurrentInputValue = (event) => {
        setState({ ...state, currentInputValue: event.target.value });
    };

    const updateNewInputValue = (event) => {
        setState({ ...state, newInputValue: event.target.value });
    };

    const submitRequest = () => {
        if (state.loading) return;

        const currentPassword = state.currentInputValue;
        const newPassword = state.newInputValue;

        if (!currentPassword) {
            setState({
                ...state,
                invalidCurrentPassword: true,
                newPasswordLengthError: false,
                submitError: false,
            });
        } else if (newPassword.length < 8) {
            setState({
                ...state,
                invalidCurrentPassword: false,
                newPasswordLengthError: true,
                submitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            changePassword(currentPassword, newPassword, (response) => {
                if (response.authError) {
                    window.location.href = "/login?goto=changepw";
                } else if (response.newPasswordLengthError) {
                    setState({
                        ...state,
                        loading: false,
                        invalidCurrentPassword: false,
                        newPasswordLengthError: true,
                        submitError: false,
                    });
                } else if (response.invalidCurrentPassword) {
                    setState({
                        ...state,
                        loading: false,
                        invalidCurrentPassword: true,
                        newPasswordLengthError: false,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setState({
                        ...state,
                        loading: false,
                        invalidCurrentPassword: false,
                        newPasswordLengthError: false,
                        submitError: true,
                    });
                } else {
                    window.location.href = "/login";
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Change Password | Coder News" />
            <AlternateHeader
                displayMessage={`Change Password for ${username}`}
            />
            <div className="changepw-content-container">
                {!userContainsEmail && (
                    <div className="changepw-error-msg">
                        <span>
                            First, please put a valid email address in your
                            <a href={`/user?id=${username}`}>profile</a>.
                            Otherwise you could lose your account if you mistype
                            your new password.
                        </span>
                    </div>
                )}

                {/* ERROR INFO AREA */}
                {state.invalidCurrentPassword ? (
                    <div className="changepw-error-msg">
                        <span>Invalid current password.</span>
                    </div>
                ) : null}
                {state.newPasswordLengthError ? (
                    <div className="changepw-error-msg">
                        <span>Passwords should be at least 8 characters.</span>
                    </div>
                ) : null}
                {state.submitError ? (
                    <div className="changepw-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}

                {/* CURRENT PASSWORD FIELD */}
                <div className="changepw-input-item">
                    <div className="changepw-input-item-label">
                        <span>Current Password:</span>
                    </div>
                    <div className="changepw-input-item-input">
                        <input
                            type="password"
                            value={state.currentInputValue}
                            onChange={updateCurrentInputValue}
                        />
                    </div>
                </div>

                {/* NEW PASSWORD FIELD */}
                <div className="changepw-input-item">
                    <div className="changepw-input-item-label">
                        <span>New Password:</span>
                    </div>
                    <div className="changepw-input-item-input">
                        <input
                            type="password"
                            value={state.newInputValue}
                            onChange={updateNewInputValue}
                        />
                    </div>
                </div>

                {/* SUBMIT BTN */}
                <div className="changepw-submit-btn">
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

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        res.writeHead(302, {
            Location: "/login?goto=changepw",
        });

        res.end();
    }

    return {
        props: {
            userContainsEmail: authResult.authUser.containsEmail,
            username: authResult.authUser.username,
        },
    };
}
