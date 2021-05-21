/// STYLES
import "../styles/layout.css";
import "../styles/components/header.css";
import "../styles/components/footer.css";
import "../styles/components/alternateHeader.css";
import "../styles/components/item.css"
import "../styles/components/itemsList.css"

import "../styles/pages/_error.css";
import "../styles/pages/login.css";
import "../styles/pages/forgot.css";
import "../styles/pages/reset.css";
import "../styles/pages/user.css";
import "../styles/pages/changepw.css";
import "../styles/pages/submit.css";
import "../styles/pages/item.css";
import "../styles/pages/edit-item.css";
import "../styles/pages/delete-item.css";
import "../styles/pages/show.css";
import "../styles/pages/past.css";
import "../styles/pages/favorites.css";

export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}
