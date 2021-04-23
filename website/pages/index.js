import { Component } from "react";

/// COMPONENTS
import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader";

import authUser from "../api/users/authUser.js";

export default class Home extends Component {
    render() {
        return (
            <div className="layout-wrapper">
                <HeadMetadata
                    title="Coder News"
                    description="News and discussion for software engineers"
                />
                <Header
                    userSignedIn={this.props.authUserData?.userSignedIn}
                    username={this.props.authUserData?.username}
                    karma={this.props.authUserData?.karma}
                />
                <div className="homepage-content-container">
                    Your Next.js App
                </div>
                <Footer />
            </div>
        );
    }
}

export async function getServerSideProps({ req }) {
    const authResult = await authUser(req);

    return {
        props: {
            authUserData:
                authResult && authResult.authUser ? authResult.authUser : {},
        },
    };
}
