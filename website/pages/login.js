import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import createNewUser from "../api/users/createNewUser.js";
import loginUser from "../api/users/loginUser.js";
import authUser from "../api/users/authUser.js";

export default function Login({ goto }) {
    const [loginState, setLoginState] = useState({
        loginUsernameInputValue: "",
        loginPasswordInputValue: "",
    });

    const [createAccountState, setCreateAccountState] = useState({
        createAccountUsernameInputValue: "",
        createAcountPasswordInputValue: "",
    });

    const [error, setError] = useState({
        loginCredentialError: false,
        loginSubmitError: false,
        createAccountUsernameExistsError: false,
        createAccountUsernameLengthError: false,
        createAccountPasswordLengthError: false,
        createAccountSubmitError: false,
        bannedError: false
    });

    const [loading, setLoading] = useState(false);

    const updateLoginUsernameInputValue = (event) => {
        setLoginState({
            ...loginState,
            loginUsernameInputValue: event.target.value,
        });
    };

    const updateLoginPasswordInputValue = (event) => {
        setLoginState({
            ...loginState,
            loginPasswordInputValue: event.target.value,
        });
    };

    const updateCreateAccountUsernameInputValue = (event) => {
        setCreateAccountState({
            ...createAccountState,
            createAccountUsernameInputValue: event.target.value,
        });
    };

    const updateCreateAccountPasswordInputValue = (event) => {
        setCreateAccountState({
            ...createAccountState,
            createAcountPasswordInputValue: event.target.value,
        });
    };

    const submitLogin = () => {
        if (loading) return;

        const username = loginState.loginUsernameInputValue;
        const password = loginState.loginPasswordInputValue;

        if (username.length === 0 || password.length === 0) {
            setError({
                ...error,
                loginCredentialError: true,
                loginSubmitError: false,
            });
        } else {
            setLoading(true);

            loginUser(username, password, (response) => {
                setLoading(false);
                if (response.credentialError) {
                    setError({
                        ...error,
                        loginCredentialError: true,
                        loginSubmitError: false,
                    });
                } else if (response.bannedError) {
                    setError({
                        ...error,
                        bannedError: true,
                        loginCredentialError: false,
                        loginSubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        ...error,
                        loginCredentialError: false,
                        loginSubmitError: true,
                    });
                } else {
                    Router.push(`/${goto}`);
                    // location.href = `/${goto}`;
                }
            });
        }
    };

    const submitCreateAccount = () => {
        if (loading) return;

        const username = createAccountState.createAccountUsernameInputValue;
        const password = createAccountState.createAcountPasswordInputValue;

        if (username.length < 2 || username.length > 15) {
            setError({
                ...error,
                createAccountUsernameExistsError: false,
                createAccountUsernameLengthError: true,
                createAccountPasswordLengthError: false,
                createAccountSubmitError: false,
            });
        } else if (password.length < 8) {
            setError({
                ...error,
                createAccountUsernameExistsError: false,
                createAccountUsernameLengthError: false,
                createAccountPasswordLengthError: true,
                createAccountSubmitError: false,
            });
        } else {
            setLoading(true);

            createNewUser(username, password, (response) => {
                setLoading(false);
                if (response.usernameLengthError) {
                    setError({
                        ...error,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: true,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: false,
                    });
                } else if (response.passwordLengthError) {
                    setError({
                        ...error,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: true,
                        createAccountSubmitError: false,
                    });
                } else if (response.alreadyExistUser) {
                    setError({
                        ...error,
                        createAccountUsernameExistsError: true,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        ...error,
                        createAccountUsernameExistsError: false,
                        createAccountUsernameLengthError: false,
                        createAccountPasswordLengthError: false,
                        createAccountSubmitError: true,
                    });
                } else {
                    // refer most bottom below on `getServerSideProps` for ${goto}
                    Router.push(`/${goto}`);
                    // location.href = `/${goto}`;
                }
            });
        }
    };

    return (
        <div className="login-wrapper layout-wrapper">
            <HeadMetadata title="Login | HeckarNews" />
            <AlternateHeader displayMessage="Login | Signup" />

            {/*LOGIN SECTION*/}
            {error.loginCredentialError ? (
                <div className="login-error-msg">
                    <span>Bad login.</span>
                </div>
            ) : null}
            {error.loginSubmitError ? (
                <div className="login-error-msg">
                    <span>An error occurred.</span>
                </div>
            ) : null}
            {error.bannedError ? (
                <div className="login-error-msg">
                    <span>User is banned.</span>
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
                        value={loginState.loginUsernameInputValue}
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
                        value={loginState.loginPasswordInputValue}
                        onChange={updateLoginPasswordInputValue}
                    />
                </div>
            </div>
            <div className="login-submit-btn">
                <input type="submit" value="login" onClick={() => submitLogin()} />
                &nbsp;
                {loading && <span> loading...</span>}
            </div>
            <div className="login-input-item-forgot-text">
                <span>
                    <Link href="/forgot">Forgot your Password?</Link>
                </span>
            </div>

            <div
                style={{
                    borderTop: "2px solid #FF6600",
                    paddingBottom: "20px",
                }}
            />

            {/*CREATE ACCOUNT SECTION*/}
            {error.createAccountUsernameExistsError ? (
                <div className="login-error-msg">
                    <span>That username is taken.</span>
                </div>
            ) : null}
            {error.createAccountUsernameLengthError ? (
                <div className="login-error-msg">
                    <span>Username must be between 2 and 15 characters long.</span>
                </div>
            ) : null}
            {error.createAccountPasswordLengthError ? (
                <div className="login-error-msg">
                    <span>Passwords should be at least 8 characters.</span>
                </div>
            ) : null}
            {error.createAccountSubmitError ? (
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
                        value={createAccountState.createAccountUsernameInputValue}
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
                        value={createAccountState.createAcountPasswordInputValue}
                        onChange={updateCreateAccountPasswordInputValue}
                    />
                </div>
            </div>
            <div className="login-submit-btn">
                <input type="submit" value="create account" onClick={() => submitCreateAccount()} />
                &nbsp;
                {loading && <span> loading...</span>}
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
