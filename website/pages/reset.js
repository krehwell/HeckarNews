import { Component } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import resetPassword from "../api/users/resetPassword.js";

export default class extends Component {
    constructor() {
        super();
        this.state = {
            passwordInputValue: "",
            passwordLengthError: false,
            expiredTokenError: false,
            invalidTokenError: false,
            submitError: false,
        };
    }

    updatePasswordInputValue = (event) => {
        this.setState({ passwordInputValue: event.target.value });
    };

    submitRequest = () => {
        if (this.state.loading) return;

        if (this.state.passwordInputValue.length < 8) {
            this.setState({
                passwordLengthError: true,
                expiredTokenError: false,
                invalidTokenError: false,
                submitError: false,
            });
        } else {
            this.setState({ loading: true });

            resetPassword(
                this.props.username,
                this.state.passwordInputValue,
                this.props.resetToken,
                (response) => {
                    if (response.invalidTokenError) {
                        this.setState({
                            loading: false,
                            passwordLengthError: false,
                            expiredTokenError: false,
                            invalidTokenError: true,
                            submitError: false,
                        });
                    } else if (response.expiredTokenError) {
                        this.setState({
                            loading: false,
                            passwordLengthError: false,
                            expiredTokenError: true,
                            invalidTokenError: false,
                            submitError: false,
                        });
                    } else if (response.passwordLengthError) {
                        this.setState({
                            loading: false,
                            passwordLengthError: true,
                            expiredTokenError: false,
                            invalidTokenError: false,
                            submitError: false,
                        });
                    } else if (response.submitError || !response.success) {
                        this.setState({
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

    render() {
        return (
            <div className="layout-wrapper">
                <HeadMetadata title="Reset Password | HeckarNews" />
                <AlternateHeader displayMessage="Reset Password" />
                <div className="reset-password-content-container">
                    {this.state.passwordLengthError ? (
                        <div className="reset-password-error-msg">
                            <span>
                                Passwords should be at least 8 characters.
                            </span>
                        </div>
                    ) : null}
                    {this.state.expiredTokenError ? (
                        <div className="reset-password-error-msg">
                            <span>Reset token has expired.</span>
                        </div>
                    ) : null}
                    {this.state.invalidTokenError ? (
                        <div className="reset-password-error-msg">
                            <span>Reset token is invalid.</span>
                        </div>
                    ) : null}
                    {this.state.submitError ? (
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
                                value={this.state.passwordInputValue}
                                onChange={this.updatePasswordInputValue}
                            />
                        </div>
                    </div>
                    <div className="reset-password-submit-btn">
                        <input
                            type="submit"
                            value="Change"
                            onClick={() => this.submitRequest()}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export async function getServerSideProps({ query }) {
    return {
        props: {
            resetToken: query.token,
            username: query.username,
        },
    };
}
