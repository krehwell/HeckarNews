import { useState } from "react";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../api/users/authUser.js";

export default function Submit({}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Submit | Coder News" />
            <AlternateHeader displayMessage="Submit" />
            <div className="submit-content-container"></div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        res.writeHead(302, {
            Location: "/login?goto=submit",
        });

        res.end();
    }

    return {
        props: {},
    };
}
