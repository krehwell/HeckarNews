import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../api/users/authUser.js";
import submitNewItem from "../api/items/submitNewItem.js";

export default function Submit({}) {
    const [state, setState] = useState({
        titleInputValue: "",
        urlInputValue: "",
        textInputValue: "",

        titleRequiredError: false,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: false,
        submitError: false,

        loading: false,
    });

    const updateTitleInputValue = (event) => {
        setState({ ...state, titleInputValue: event.target.value });
    };

    const updateUrlInputValue = (event) => {
        setState({ ...state, urlInputValue: event.target.value });
    };

    const updateTextInputValue = (event) => {
        setState({ ...state, textInputValue: event.target.value });
    };

    const submitRequest = () => {
        if (state.loading) return;

        if (!state.titleInputValue.trim()) {
            setState({
                ...state,
                titleRequiredError: true,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
            });
        } else if (state.titleInputValue.length > 80) {
            setState({
                ...state,
                titleRequiredError: false,
                titleTooLongError: true,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
            });
        } else if (state.urlInputValue && state.textInputValue) {
            setState({
                ...state,
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: true,
                textTooLongError: false,
                submitError: false,
            });
        } else if (state.textInputValue.length > 5000) {
            setState({
                ...state,
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: true,
                submitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            submitNewItem(
                state.titleInputValue,
                state.urlInputValue,
                state.textInputValue,
                (response) => {
                    if (response.authError) {
                        window.location.href = "/login?goto=submit";
                    } else if (response.titleRequiredError) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: true,
                            titleTooLongError: false,
                            invalidUrlError: false,
                            urlAndTextError: false,
                            textTooLongError: false,
                            submitError: false,
                        });
                    } else if (response.urlAndTextError) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: false,
                            titleTooLongError: false,
                            invalidUrlError: false,
                            urlAndTextError: true,
                            textTooLongError: false,
                            submitError: false,
                        });
                    } else if (response.invalidUrlError) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: false,
                            titleTooLongError: false,
                            invalidUrlError: true,
                            urlAndTextError: false,
                            textTooLongError: false,
                            submitError: false,
                        });
                    } else if (response.titleTooLongError) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: false,
                            titleTooLongError: true,
                            invalidUrlError: false,
                            urlAndTextError: false,
                            textTooLongError: false,
                            submitError: false,
                        });
                    } else if (response.textTooLongError) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: false,
                            titleTooLongError: false,
                            invalidUrlError: false,
                            urlAndTextError: false,
                            textTooLongError: true,
                            submitError: false,
                        });
                    } else if (response.submitError || !response.success) {
                        setState({
                            ...state,
                            loading: false,
                            titleRequiredError: false,
                            titleTooLongError: false,
                            invalidUrlError: false,
                            urlAndTextError: false,
                            textTooLongError: false,
                            submitError: true,
                        });
                    } else {
                        window.location.href = "/newest";
                    }
                }
            );
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Submit | HeckarNews" />
            <AlternateHeader displayMessage="Submit" />
            <div className="submit-content-container">
                {state.titleRequiredError ? (
                    <div className="submit-content-error-msg">
                        <span>Title is required.</span>
                    </div>
                ) : null}
                {state.titleTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Title exceeds limit of 80 characters.</span>
                    </div>
                ) : null}
                {state.invalidUrlError ? (
                    <div className="submit-content-error-msg">
                        <span>URL is invalid.</span>
                    </div>
                ) : null}
                {state.urlAndTextError ? (
                    <div className="submit-content-error-msg">
                        <span>
                            Submissions can’t have both urls and text, so you
                            need to pick one. If you keep the url, you can
                            always post your text as a comment in the thread.
                        </span>
                    </div>
                ) : null}
                {state.textTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Text exceeds limit of 5,000 characters.</span>
                    </div>
                ) : null}
                {state.submitError ? (
                    <div className="submit-content-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}

                {/* TITLE FIELD */}
                <div className="submit-content-input-item title">
                    <div className="submit-content-input-item-label">
                        <span>title</span>
                    </div>
                    <div className="submit-content-input-item-input">
                        <input
                            type="text"
                            value={state.titleInputValue}
                            onChange={updateTitleInputValue}
                        />
                    </div>
                </div>

                {/* URL FIELD */}
                <div className="submit-content-input-item url">
                    <div className="submit-content-input-item-label">
                        <span>url</span>
                    </div>
                    <div className="submit-content-input-item-input">
                        <input
                            type="text"
                            value={state.urlInputValue}
                            onChange={updateUrlInputValue}
                        />
                    </div>
                </div>

                <div className="submit-content-input-or-divider">
                    <span>or</span>
                </div>

                {/* TEXT FIELD */}
                <div className="submit-content-text-input-item">
                    <div className="submit-content-text-input-item-label">
                        <span>text</span>
                    </div>
                    <div className="submit-content-text-input-item-input">
                        <textarea
                            type="text"
                            value={state.textInputValue}
                            onChange={updateTextInputValue}
                        />
                    </div>
                </div>

                {/* SUBMIT BTN */}
                <div className="submit-content-input-btn">
                    <input
                        type="submit"
                        value="submit"
                        onClick={() => submitRequest()}
                    />
                    {state.loading && <span> loading...</span>}
                </div>
                <div className="submit-content-bottom-instructions">
                    <span>
                        Leave url blank to submit a question for discussion. If
                        there is no url, the text (if any) will appear at the
                        top of the thread.
                    </span>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        res.writeHead(302, {
            Location: "/login?goto=submit",
        });

        res.end();
    }

    return {
        props: {},
    };
}
