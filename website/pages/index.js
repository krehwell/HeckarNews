/// COMPONENTS
import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader";

import authUser from "../api/users/authUser.js";

export default function Home({ authUserData }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title="HeckarNews"
                description="News and discussion for software engineers"
            />
            <Header
                userSignedIn={authUserData?.userSignedIn}
                username={authUserData?.username}
                karma={authUserData?.karma}
            />
            <div className="homepage-content-container">t(·̿Ĺ̯·̿ ̿) Hacker News Clone</div>
            <Footer />
        </div>
    );
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
