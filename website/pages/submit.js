import { useState } from "react";
import Router from "next/router";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../api/users/authUser.js";
import submitNewItem from "../api/items/submitNewItem.js";

export default function Submit({}) {
    const [loading, setLoading] = useState(false);
    const [titleInputValue, setTitleInputValue] = useState("");
    const [urlInputValue, setUrlInputValue] = useState("");
    const [textInputValue, setTextInputValue] = useState("");

    const [error, setError] = useState({
        titleRequiredError: false,
        titleTooLongError: false,
        invalidUrlError: false,
        urlAndTextError: false,
        textTooLongError: false,
        submitError: false,
    });

    const updateTitleInputValue = (event) => {
        setTitleInputValue(event.target.value);
    };

    const updateUrlInputValue = (event) => {
        setUrlInputValue(event.target.value);
    };

    const updateTextInputValue = (event) => {
        setTextInputValue(event.target.value);
    };

    const submitRequest = () => {
        if (loading) return;

        if (!titleInputValue.trim()) {
            setError({
                titleRequiredError: true,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
            });
        } else if (titleInputValue.length > 80) {
            setError({
                titleRequiredError: false,
                titleTooLongError: true,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: false,
                submitError: false,
            });
        } else if (urlInputValue && textInputValue) {
            setError({
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: true,
                textTooLongError: false,
                submitError: false,
            });
        } else if (textInputValue.length > 5000) {
            setError({
                titleRequiredError: false,
                titleTooLongError: false,
                invalidUrlError: false,
                urlAndTextError: false,
                textTooLongError: true,
                submitError: false,
            });
        } else {
            setLoading(true);

            submitNewItem(titleInputValue, urlInputValue, textInputValue, (response) => {
                setLoading(false);

                if (response.authError) {
                    // location.href = "/login?goto=submit";
                    Router.push("/login?goto=submit");
                } else if (response.titleRequiredError) {
                    setError({
                        titleRequiredError: true,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.urlAndTextError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: true,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.invalidUrlError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: true,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.titleTooLongError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: true,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.textTooLongError) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: true,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        titleRequiredError: false,
                        titleTooLongError: false,
                        invalidUrlError: false,
                        urlAndTextError: false,
                        textTooLongError: false,
                        submitError: true,
                    });
                } else {
                    // location.href = "/newest";
                    Router.push("/newest");
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Submit | HeckarNews" />
            <AlternateHeader displayMessage="Submit" />
            <div className="submit-content-container">
                {error.titleRequiredError ? (
                    <div className="submit-content-error-msg">
                        <span>Title is required.</span>
                    </div>
                ) : null}
                {error.titleTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Title exceeds limit of 80 characters.</span>
                    </div>
                ) : null}
                {error.invalidUrlError ? (
                    <div className="submit-content-error-msg">
                        <span>URL is invalid.</span>
                    </div>
                ) : null}
                {error.urlAndTextError ? (
                    <div className="submit-content-error-msg">
                        <span>
                            Submissions can’t have both urls and text, so you need to pick one. If you keep the url, you
                            can always post your text as a comment in the thread.
                        </span>
                    </div>
                ) : null}
                {error.textTooLongError ? (
                    <div className="submit-content-error-msg">
                        <span>Text exceeds limit of 5,000 characters.</span>
                    </div>
                ) : null}
                {error.submitError ? (
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
                        <input type="text" value={titleInputValue} onChange={updateTitleInputValue} />
                    </div>
                </div>

                {/* URL FIELD */}
                <div className="submit-content-input-item url">
                    <div className="submit-content-input-item-label">
                        <span>url</span>
                    </div>
                    <div className="submit-content-input-item-input">
                        <input type="text" value={urlInputValue} onChange={updateUrlInputValue} />
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
                        <textarea type="text" value={textInputValue} onChange={updateTextInputValue} />
                    </div>
                </div>

                {/* SUBMIT BTN */}
                <div className="submit-content-input-btn">
                    <input type="submit" value="submit" onClick={() => submitRequest()} />
                    {loading && <span> loading...</span>}
                </div>
                <div className="submit-content-bottom-instructions">
                    <span>
                        Leave url blank to submit a question for discussion. If there is no url, the text (if any) will
                        appear at the top of the thread.
                    </span>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        return {
            redirect: {
                destination: "/login?goto=submit",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}
