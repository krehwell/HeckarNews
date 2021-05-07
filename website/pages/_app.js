/// STYLES
import "../styles/layout.css";
import "../styles/components/header.css";
import "../styles/components/footer.css";
import "../styles/components/alternateHeader.css";
import "../styles/pages/_error.css";
import "../styles/pages/login.css";
import "../styles/pages/forgot.css";
import "../styles/pages/reset.css";

export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}
