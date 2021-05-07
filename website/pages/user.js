import { Component } from "react";
import moment from "moment";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";

import getUserData from "../api/users/getUserData.js";

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aboutInputValue: this.props.userData
                ? this.props.userData.about
                : "",
            emailInputValue: this.props.userData
                ? this.props.userData.email
                : "",
            showDeadValue:
                this.props.userData && this.props.userData.showDead
                    ? "yes"
                    : "no",
            loading: false,
            submitError: false,
        };
    }

    updateAboutInputValue = (event) => {
        this.setState({ aboutInputValue: event.target.value });
    };

    setInitialTextareaHeight = () => {
        if (this.props.userData.about) {
            const numOfLines = this.props.userData.about.split(/\r\n|\r|\n/)
                .length;

            return numOfLines + 3;
        } else {
            return 6;
        }
    };

    updateEmailInputValue = (event) => {
        this.setState({ emailInputValue: event.target.value });
    };

    updateShowDeadValue = (event) => {
        this.setState({ showDeadValue: event.target.value });
    };

    submitUpdateRequest = () => {
        if (this.state.loading) return;

        const inputData = {
            about: this.state.aboutInputValue,
            email: this.state.emailInputValue,
            showDead: this.state.showDeadValue === "yes" ? true : false,
        };

        this.setState({ loading: true });

        const self = this;

        // call to REST API goes here
    };

    render() {
        return (
            <div className="layout-wrapper">
                <HeadMetadata
                    title={
                        this.props.userData
                            ? `Profile: ${this.props.username} | HeckarNews`
                            : "User Profile | HeckarNews"
                    }
                />
                <Header
                    userSignedIn={
                        this.props.authUserData &&
                        this.props.authUserData.userSignedIn
                    }
                    username={
                        this.props.authUserData &&
                        this.props.authUserData.username
                    }
                    karma={
                        this.props.authUserData && this.props.authUserData.karma
                    }
                    goto={this.props.goToString}
                />
                <div className="user-content-container">
                    {!this.props.getDataError && !this.props.notFoundError ? (
                        <>
                            {
                                /***** IF USER IS PRIVATE  *****/
                                this.props.showPrivateUserData ? (
                                    <div className="user-private-data">
                                        {!this.props.userData.email ? (
                                            <div className="user-add-email-address-msg">
                                                <span>
                                                    Please put a valid address
                                                    in the email field, or we
                                                    won't be able to send you a
                                                    new password if you forget
                                                    yours. Your address is only
                                                    visible to you and us.
                                                    Crawlers and other users
                                                    can't see it.
                                                </span>
                                            </div>
                                        ) : null}

                                        {/* USERNAME SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span>user:</span>
                                            </div>
                                            <div className="user-item-content username">
                                                <span>
                                                    {
                                                        this.props.userData
                                                            .username
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* CREATED SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span>created:</span>
                                            </div>
                                            <div className="user-item-content created">
                                                <span>
                                                    {moment
                                                        .unix(
                                                            this.props.userData
                                                                .created
                                                        )
                                                        .format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* KARMA SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span>karma:</span>
                                            </div>
                                            <div className="user-item-content karma">
                                                <span>
                                                    {this.props.userData.karma.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ABOUT FIELD */}
                                        <div className="user-item">
                                            <div className="user-item-label about">
                                                <span>about:</span>
                                            </div>
                                            <div className="user-item-content about">
                                                <textarea
                                                    cols={60}
                                                    rows={this.setInitialTextareaHeight()}
                                                    wrap="virtual"
                                                    type="text"
                                                    value={
                                                        this.state
                                                            .aboutInputValue
                                                    }
                                                    onChange={
                                                        this
                                                            .updateAboutInputValue
                                                    }
                                                />
                                                <span className="user-item-about-help">
                                                    <a href="/formatdoc">
                                                        help
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* EMAIL FIELD */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span>email:</span>
                                            </div>
                                            <div className="user-item-content email">
                                                <input
                                                    type="text"
                                                    value={
                                                        this.state
                                                            .emailInputValue
                                                    }
                                                    onChange={
                                                        this
                                                            .updateEmailInputValue
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* SHOWDEAD SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span>showdead:</span>
                                            </div>
                                            <div className="user-item-content email">
                                                <select
                                                    value={
                                                        this.state.showDeadValue
                                                    }
                                                    onChange={
                                                        this.updateShowDeadValue
                                                    }>
                                                    <option value="no">
                                                        no
                                                    </option>
                                                    <option value="yes">
                                                        yes
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* CHANGE PASSWORD SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a href="/changepw">
                                                        change password
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* SUBMISSION SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/submitted?id=${this.props.username}`}>
                                                        submissions
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* COMMENT SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/threads?id=${this.props.username}`}>
                                                        comments
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* HIDDEN SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a href={`/hidden`}>
                                                        hidden
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* UPVOTE COMMENT SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/upvoted?id=${this.props.username}`}>
                                                        upvoted items
                                                    </a>
                                                </span>
                                                <span> / </span>
                                                <span>
                                                    <a
                                                        href={`/upvoted?id=${this.props.username}&comments=t`}>
                                                        comments
                                                    </a>
                                                </span>
                                                <span>
                                                    {" "}
                                                    <i>(private)</i>
                                                </span>
                                            </div>
                                        </div>

                                        {/* FAVORITE COMMENT SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/favorites?id=${this.props.username}`}>
                                                        favorite items
                                                    </a>
                                                </span>
                                                <span> / </span>
                                                <span>
                                                    <a
                                                        href={`/favorites?id=${this.props.username}&comments=t`}>
                                                        comments
                                                    </a>
                                                </span>
                                                <span>
                                                    {" "}
                                                    <i>(shared)</i>
                                                </span>
                                            </div>
                                        </div>

                                        {/* SUBMIT FORM SECTION */}
                                        <div className="user-submit-btn">
                                            <input
                                                type="submit"
                                                value="update"
                                                onClick={() =>
                                                    this.submitUpdateRequest()
                                                }
                                            />
                                        </div>
                                        {this.state.submitError ? (
                                            <div className="user-submit-error-msg">
                                                <span>An error occurred.</span>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    /***** IF USER IS PUBLIC  *****/
                                    <div className="user-public-data">
                                        {/* USERNAME SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span>user:</span>
                                            </div>
                                            <div className="user-item-content username">
                                                <span>
                                                    {
                                                        this.props.userData
                                                            .username
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* CREATED SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span>created:</span>
                                            </div>
                                            <div className="user-item-content created">
                                                <span>
                                                    {moment
                                                        .unix(
                                                            this.props.userData
                                                                .created
                                                        )
                                                        .format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* KARMA SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span>karma:</span>
                                            </div>
                                            <div className="user-item-content karma">
                                                <span>
                                                    {this.props.userData.karma.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ABOUT SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label about public">
                                                <span>about:</span>
                                            </div>
                                            <div className="user-item-content about public">
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: this.props
                                                            .userData.about,
                                                    }}></span>
                                            </div>
                                        </div>

                                        {/* SUBMISSION SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/submitted?id=${this.props.username}`}>
                                                        submissions
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* COMMENT SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/threads?id=${this.props.username}`}>
                                                        comments
                                                    </a>
                                                </span>
                                            </div>
                                        </div>

                                        {/* FAVORITE SECTION */}
                                        <div className="user-item">
                                            <div className="user-item-label public">
                                                <span></span>
                                            </div>
                                            <div className="user-item-content">
                                                <span>
                                                    <a
                                                        href={`/favorites?id=${this.props.username}`}>
                                                        favorites
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </>
                    ) : (
                        <div className="user-get-data-error-msg">
                            {this.props.notFoundError ? (
                                <span>User not found.</span>
                            ) : (
                                <span>An error occurred.</span>
                            )}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        );
    }
}

export async function getServerSideProps({ req, res, query }) {
    const apiResult = await getUserData(query.id, req);
    // console.log(apiResult);

    return {
        props: {
            username: query.id,
            userData: apiResult.user || {},
            showPrivateUserData: apiResult && apiResult.showPrivateUserData,
            authUserData:
                apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: apiResult.getDataError || false,
            notFoundError: apiResult.notFoundError || false,
            goToString: `user?id=${query.id}`,
        },
    };
}
