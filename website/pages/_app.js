import NProgress from "nprogress";
import Router, { useRouter } from "next/router";

/// GLOBAL STYLES
import "../styles/nprogress.css";
import "../styles/layout.css";

/// COMPONENT STYLES
import "../styles/components/header.css";
import "../styles/components/footer.css";
import "../styles/components/alternateHeader.css";
import "../styles/components/item.css";
import "../styles/components/itemsList.css";
import "../styles/components/comment.css";
import "../styles/components/commentSection.css";
import "../styles/components/commentsList.css"

/// SEARCH COMPONENT
import "../styles/components/search/header.css";
import "../styles/components/search/footer.css";
import "../styles/components/search/item.css";
import "../styles/components/search/comment.css";
import "../styles/components/search/filters.css";
import "../styles/components/search/datePicker.css";
import "../styles/components/search/pageNumbers.css";

/// PAGES STYLES
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
import "../styles/pages/comment.css";
import "../styles/pages/edit-comment.css";
import "../styles/pages/delete-comment.css";
import "../styles/pages/formatdoc.css";
import "../styles/pages/newsfaq.css";
import "../styles/pages/newsguidelines.css";
import "../styles/pages/showguidelines.css";

/// SEARCH PAGES
import "../styles/search/index.css";
import "../styles/pages/search/about.css";

/// MODERATION PAGES
import "../styles/pages/moderation/shadow-banned-users.css";
import "../styles/pages/moderation/banned-users.css";
import "../styles/pages/moderation/logs.css";

/// NProgress CONFIG
NProgress.configure({ easing: "ease", speed: 750, showSpinner: false });
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function MyApp({ Component, pageProps }) {
    const router = useRouter();
    // SUPER IMPORTANT: to put `key={router.asPath}` to allow re-render on same path different query
    return <Component {...pageProps} key={router.asPath} />;
}
