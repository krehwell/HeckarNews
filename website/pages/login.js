import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import createNewUser from "../api/users/createNewUser.js";
import loginUser from "../api/users/loginUser.js";
import authUser from "../api/users/authUser.js";

export default function Login({ goto }) {
    const [state, setState] = useState({
        loading: false,

        // login
        loginUsernameInputValue: "",
        loginPasswordInputValue: "",
        loginCredentialError: false,
        loginSubmitError: false,

        //create account
        createAccountUsernameInputValue: "",
        createAcountPasswordInputValue: "",
        createAccountUsernameExistsError: false,
        createAccountUsernameLengthError: false,
        createAccountPasswordLengthError: false,
        createAccountSubmitError: false,
    });

    const updateLoginUsernameInputValue = (event) => {
        setState({ ...state, loginUsernameInputValue: event.target.value });
    };

    const updateLoginPasswordInputValue = (event) => {
        setState({ ...state, loginPasswordInputValue: event.target.value });
    };

    const updateCreateAccountUsernameInputValue = (event) => {
        setState({
            ...state,
            createAccountUsernameInputValue: event.target.value,
        });
    };

    const updateCreateAccountPasswordInputValue = (event) => {
        setState({
            ...state,
            createAcountPasswordInputValue: event.target.value,
        });
    };

    const submitLogin = () => {
        if (state.loading) return;

        const username = state.loginUsernameInputValue;
        const password = state.loginPasswordInputValue;

        if (username.length === 0 || password.length === 0) {
            setState({
                ...state,
                loginCredentialError: true,
                loginSubmitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            loginUser(username, password, (response) => {
                if (response.credentialError) {
                    setState({
                        ...state,
                        loading: false,
                        loginCredentialError: true,
                        loginSubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setState({
                        ...state,
                        loading: false,
                        loginCredentialError: false,
                        loginSubmitError: true,
                    });
                } else {
                    window.location.href = `/${goto}`;
                }
            });
        }
    };

    const submitCreateAccount = () => {
        if (state.loading) {
            return;
        }

        const username = state.createAccountUsernameInputValue;
        const password = state.createAcountPasswordInputValue;

        if (username.length < 2 || username.length > 15) {
            setState({
                ...state,
                createAccountUsernameExistsError: false,
                createAccountUsernameLengthError: true,
                createAccountPasswordLengthError: false,
                createAccountSubmitError: false,
            });
        } else if (password.length < 8) {
            setState({
                ...state,
                createAccountUsernameExistsError: false,
                createAccountUsernameLengthError: false,
                createAccountPasswordLengthError: true,
                createAccountSubmitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            createNewUser(username, password, (response) => {
                if (response.usernameLengthError) {
                    setState({
                        ...state,
                        loading: false,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: true,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: false,
                    });
                } else if (response.passwordLengthError) {
                    setState({
                        ...state,
                        loading: false,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: true,
                        createAccountSubmitError: false,
                    });
                } else if (response.alreadyExistUser) {
                    setState({
                        ...state,
                        loading: false,
                        createAccountUsernameExistsError: true,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setState({
                        ...state,
                        loading: false,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: true,
                    });
                } else {
                    // refer most bottom below on `getServerSideProps`
                    window.location.href = `/${goto}`;
                }
            });
        }
    };

    return (
        <div className="login-wrapper layout-wrapper">
            <HeadMetadata title="Login | HeckarNews" />
            <AlternateHeader displayMessage="Login | Signup" />

            {/*LOGIN SECTION*/}
            {state.loginCredentialError ? (
                <div className="login-error-msg">
                    <span>Bad login.</span>
                </div>
            ) : null}
            {state.loginSubmitError ? (
                <div className="login-error-msg">
                    <span>An error occurred.</span>
                </div>
            ) : null}
            <div className="login-header">
                <span>Login</span>
            </div>
            <div className="login-input-item">
                <div className="login-input-item-label">
                    <span>username:</span>
                </div>
                <div className="login-input-item-input">
                    <input
                        type="text"
                        value={state.loginUsernameInputValue}
                        onChange={updateLoginUsernameInputValue}
                    />
                </div>
            </div>
            <div className="login-input-item">
                <div className="login-input-item-label">
                    <span>password:</span>
                </div>
                <div className="login-input-item-input">
                    <input
                        type="password"
                        value={state.loginPasswordInputValue}
                        onChange={updateLoginPasswordInputValue}
                    />
                </div>
            </div>
            <div className="login-submit-btn">
                <input
                    type="submit"
                    value="login"
                    onClick={() => submitLogin()}
                />
            </div>
            <div className="login-input-item-forgot-text">
                <span>
                    <a href="/forgot">Forgot your Password?</a>
                </span>
            </div>

            <div
                style={{
                    borderTop: "2px solid #FF6600",
                    paddingBottom: "20px",
                }}
            />

            {/*CREATE ACCOUNT SECTION*/}
            {state.createAccountUsernameExistsError ? (
                <div className="login-error-msg">
                    <span>That username is taken.</span>
                </div>
            ) : null}
            {state.createAccountUsernameLengthError ? (
                <div className="login-error-msg">
                    <span>
                        Username must be between 2 and 15 characters long.
                    </span>
                </div>
            ) : null}
            {state.createAccountPasswordLengthError ? (
                <div className="login-error-msg">
                    <span>Passwords should be at least 8 characters.</span>
                </div>
            ) : null}
            {state.createAccountSubmitError ? (
                <div className="login-error-msg">
                    <span>An error occurred.</span>
                </div>
            ) : null}
            <div className="login-header">
                <span>Create Account</span>
            </div>
            <div className="login-input-item">
                <div className="login-input-item-label">
                    <span>username:</span>
                </div>
                <div className="login-input-item-input">
                    <input
                        type="text"
                        value={state.createAccountUsernameInputValue}
                        onChange={updateCreateAccountUsernameInputValue}
                    />
                </div>
            </div>
            <div className="login-input-item">
                <div className="login-input-item-label">
                    <span>password:</span>
                </div>
                <div className="login-input-item-input">
                    <input
                        type="password"
                        value={state.createAcountPasswordInputValue}
                        onChange={updateCreateAccountPasswordInputValue}
                    />
                </div>
            </div>
            <div className="login-submit-btn">
                <input
                    type="submit"
                    value="create account"
                    onClick={() => submitCreateAccount()}
                />
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (authResult.success) {
        res.writeHead(302, {
            Location: "/",
        });

        res.end();
    }

    return {
        props: {
            goto: query.goto ? decodeURIComponent(query.goto) : "",
        },
    };
}
