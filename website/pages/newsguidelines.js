import Link from "next/link";

import HeadMetadata from "../components/headMetadata.js";

export default function NewsGuidelines() {
    return (
        <div className="news-guidelines-wrapper">
            <HeadMetadata title="HeckarNews Guidelines" />
            <div className="news-guidelines-top-image">
                <Link href="/">
                    <a>
                        <img src="/favicon.png" />
                    </a>
                </Link>
                <h1>HeckarNews</h1>
            </div>
            <div className="news-guidelines-text-container">
                <p className="news-guidelines-text-title">HeckarNews Guidelines</p>
                <p className="news-guidelines-text-title">What to Submit</p>
                <p>
                    On-Topic: Anything that someone would find interesting. That includes more than just coding and
                    startups. If you had to reduce it to a sentence, the answer might be: anything that gratifies one’s
                    intellectual curiosity.
                </p>
                <p>
                    Off-Topic: Most submissions about politics, or crime, or sports, unless they're evidence of some
                    interesting new phenomenon. Videos of pratfalls or disasters, or cute animal pictures. If they'd
                    cover it on TV news, it’s probably off-topic.
                </p>
                <p className="news-guidelines-text-title">In Items</p>
                <p>
                    Please don't do things to make titles stand out, like using uppercase or exclamation points, or
                    saying how great an article is. It's implicit in submitting something that you think it’s important.
                </p>
                <p>
                    Please submit the original source. If a post reports on something found on another site, submit the
                    latter.
                </p>
                <p>
                    If you submit a link to a video or pdf, please warn us by appending [video] or [pdf] to the title.
                </p>
                <p>
                    If the title includes the name of the site, please take it out, because the site name will be
                    displayed after the link.
                </p>
                <p>
                    If the title begins with a number or number + gratuitous adjective, we’d appreciate it if you’d crop
                    it. E.g. translate "10 Ways To Do X" to "How To Do X," and "14 Amazing Ys" to "Ys." Exception: when
                    the number is meaningful, e.g. "The 5 Platonic Solids."
                </p>
                <p>Otherwise please use the original title, unless it is misleading or linkbait; don’t editorialize.</p>
                <p>Please don’t submit so many links at once that the new page is dominated by your submissions.</p>
                <p className="news-guidelines-text-title">In Comments</p>
                <p>
                    Be kind. Don’t be snarky. Comments should get more thoughtful and substantive, not less, as a topic
                    gets more divisive.
                </p>
                <p>
                    When disagreeing, please reply to the argument instead of calling names. "That is idiotic; 1 + 1 is
                    2, not 3" can be shortened to "1 + 1 is 2, not 3."
                </p>
                <p>
                    Please respond to the strongest plausible interpretation of what someone says, not a weaker one
                    that’s easier to criticize. Assume good faith.
                </p>
                <p>
                    Eschew flamebait. Don’t introduce flamewar topics unless you have something genuinely new to say.
                    Avoid unrelated controversies and generic tangents.
                </p>
                <p>
                    Please don’t post shallow dismissals, especially of other people’s work. A good critical comment
                    teaches us something.
                </p>
                <p>
                    Please don’t use HeckarNews for political or ideological battle. That destroys intellectual
                    curiosity, which is what the site exists for.
                </p>
                <p>
                    Please don’t comment on whether someone read an article. "Did you even read the article? It mentions
                    that" can be shortened to "The article mentions that."
                </p>
                <p>
                    Throwaway accounts are ok for sensitive information, but please don’t create accounts routinely.
                    HeckarNews is a community—users should have an identity that others can relate to.
                </p>
                <p>
                    Please don’t use uppercase for emphasis. If you want to emphasize a word or phrase, put *asterisks*
                    around it and it will get italicized.
                </p>
                <p>
                    Please don’t make insinuations about astroturfing. It degrades discussion and is usually mistaken.
                    If you’re worried, email us and we’ll look into it.
                </p>
                <p>
                    Please don’t comment about the voting on comments. It never does any good, and it makes boring
                    reading.
                </p>
                <p>
                    Please don’t submit comments saying that HeckarNews is turning into Reddit. It’s a semi-noob
                    illusion, as old as the hills.
                </p>
                <div className="news-guidelines-bottom-divider"></div>
            </div>
        </div>
    );
}
