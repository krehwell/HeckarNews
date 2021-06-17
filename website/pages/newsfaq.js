import Link from "next/link";

import HeadMetadata from "../components/headMetadata.js";

export default function NewsFaq() {
    return (
        <div className="news-faq-wrapper">
            <HeadMetadata title="HeckarNews FAQ" />
            <div className="news-faq-top-image">
                <Link href="/">
                    <a>
                        <img src="/favicon.png" />
                    </a>
                </Link>
                <h1>HeckarNews</h1>
            </div>
            <div className="news-faq-text-container">
                <p className="news-faq-text-title">HeckarNews FAQ</p>
                <p className="news-faq-text-title">Are there rules about submissions and comments?</p>
                <p>
                    <Link href="/newsguidelines">
                        <a>Newsguidelines page</a>
                    </Link>
                </p>
                <p className="news-faq-text-title">How are items ranked?</p>
                <p>The basic algorithm divides points by a power of the time since an item was submitted.</p>
                <p className="news-faq-text-title">How is a user’s karma calculated?</p>
                <p>The number of upvotes on their items and comments minus the number of downvotes.</p>
                <p className="news-faq-text-title">Why don’t I see down arrows?</p>
                <p>
                    There are no down arrows on items. They appear on comments after users reach a certain karma
                    threshold.
                </p>
                <p className="news-faq-text-title">What kind of formatting can you use in comments?</p>
                <p>
                    <Link href="/formatdoc">
                        <a>Formatting options page</a>
                    </Link>
                </p>
                <p className="news-faq-text-title">How do I submit a question?</p>
                <p>Use the submit link in the top bar, and leave the url field blank.</p>
                <p className="news-faq-text-title">How do I make a link in a question?</p>
                <p>
                    You can’t. This is to prevent people from submitting a link with their comments in a privileged
                    position at the top of the page. If you want to submit a link with comments, just submit it, then
                    add a regular comment.
                </p>
                <p className="news-faq-text-title">In my profile, what does showdead do?</p>
                <p>If you turn it on, you’ll see all the items and comments that have been killed by moderators.</p>
                <p className="news-faq-text-title">How do I reset my password?</p>
                <p>
                    If you have an email address in your profile, request a password reset{" "}
                    <Link href="/forgot">
                        <a>here</a>
                    </Link>
                    . If you haven’t, email me@krehwell.com for help.
                </p>
                <div className="news-faq-bottom-divider"></div>
            </div>
        </div>
    );
}
