import { Component } from "react";

import HeadMetadata from "../components/headMetadata.js";

export default class _404 extends Component {
    render() {
        return (
            <div className="error-wrapper">
                <HeadMetadata title="Unkown | HeckarNews" />
                <span>An error occurred. (ERROR: 400)</span>
            </div>
        );
    }
}
