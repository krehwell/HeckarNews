import { Component } from "react";

import HeadMetadata from "../components/headMetadata.js";

import requestPasswordResetLink from "../api/users/requestPasswordResetLink.js";

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usernameInputValue: "",
            noEmailError: false,
            userNotFoundError: false,
            submitError: false,
            loading: false,
            success: false,
        };
    }

    updateUsernameInputValue = (event) => {
        this.setState({ usernameInputValue: event.target.value });
    };

    submitRequest = () => {
        if (this.state.loading) return;

        if (!this.state.usernameInputValue) {
            this.setState({ userNotFoundError: true });
        } else {
            this.setState({ loading: true });

            requestPasswordResetLink(
                this.state.usernameInputValue,
                (response) => {
                    if (response.userNotFoundError) {
                        this.setState({
                            loading: false,
                            noEmailError: false,
                            userNotFoundError: true,
                            submitError: false,
                        });
                    } else if (response.noEmailError) {
                        this.setState({
                            loading: false,
                            noEmailError: true,
                            userNotFoundError: false,
                            submitError: false,
                        });
                    } else if (response.submitError || !response.success) {
                        this.setState({
                            loading: false,
                            noEmailError: false,
                            userNotFoundError: false,
                            submitError: true,
                        });
                    } else {
                        this.setState({
                            loading: false,
                            success: true,
                            noEmailError: false,
                            userNotFoundError: false,
                            submitError: false,
                        });
                    }
                }
            );
        }
    };

    render() {
        return (
            <div className="forgot-wrapper">
                <HeadMetadata title="Forgot Password | Coder News" />
                {this.state.success ? (
                    <div className="forgot-success-msg">
                        <span>
                            Password recovery message sent. If you do not see
                            it, you may want to check your spam folder.
                        </span>
                    </div>
                ) : (
                    <>
                        {this.state.noEmailError ? (
                            <div className="forgot-error-msg">
                                <span>No valid email address in profile.</span>
                            </div>
                        ) : null}
                        {this.state.userNotFoundError ? (
                            <div className="forgot-error-msg">
                                <span>User not found.</span>
                            </div>
                        ) : null}
                        {this.state.submitError ? (
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
                                    value={this.state.usernameInputValue}
                                    onChange={this.updateUsernameInputValue}
                                />
                            </div>
                            <div className="forgot-submit-btn">
                                <input
                                    type="submit"
                                    value="Send reset email"
                                    onClick={() => this.submitRequest()}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
}
