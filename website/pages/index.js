import { Component } from "react";

/// COMPONENTS
import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader";

export default class Home extends Component {
    render() {
        return (
            <div className="layout-wrapper">
                <HeadMetadata
                    title="Coder News"
                    description="News and discussion for software engineers"
                />
                <Header />
                <div className="homepage-content-container">
                    Your Next.js App
                </div>
                <Footer />
            </div>
        );
    }
}
