/// STYLES
import "../styles/layout.css";
import "../styles/components/header.css";
import "../styles/components/footer.css";
import "../styles/components/alternateHeader.css";
import "../styles/pages/_error.css";

export default function MyApp({Component, pageProps}) {
    return <Component {...pageProps} />;
}
