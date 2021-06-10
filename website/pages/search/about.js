import Link from "next/link";

import HeadMetadata from "../../components/headMetadata.js";
import SearchPageHeader from "../../components/search/header.js";
import SearchPageFooter from "../../components/search/footer.js";

export default function About() {
    return (
        <div className="search-about-wrapper">
            <HeadMetadata title="Search About | HeckarNews" />
            <SearchPageHeader showBackButton={true} />
            <div className="search-about-content">
                <h3>About</h3>
                <p>
                    HeckarNews search provides real-time full-text search for the HeckarNews community website. The
                    search backend is implemented using{" "}
                    <Link href="http://www.algolia.com">
                        <a>Algolia</a>
                    </Link>{" "}
                    instant search engine.
                </p>
                <h3>How it works</h3>
                <p>
                    Items and comments are updated in real-time and indexed in the{" "}
                    <Link href="http://www.algolia.com">
                        <a>Algolia</a>
                    </Link>{" "}
                    search engine.
                </p>
                <h3>Credits</h3>
                <p>
                    <Link href="http://www.algolia.com">
                        <a>Algolia</a>
                    </Link>
                </p>
                <p>
                    <Link href="https://github.com/algolia/algoliasearch-client-javascript">
                        <a>Algolia JavaScript API</a>
                    </Link>
                </p>
                <p>
                    <Link href="https://news.ycombinator.com/">
                        <a>Hacker News</a>
                    </Link>
                </p>
            </div>
            <SearchPageFooter />
        </div>
    );
}
