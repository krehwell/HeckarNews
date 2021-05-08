import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

export default function _error() {
    return (
        <div className="error-wrapper layout-wrapper">
            <HeadMetadata title="Error | HeckarNews" />
            <AlternateHeader displayMessage="Website Error" />
            <span>An error occurred. (ERROR: 500)</span>
        </div>
    );
}
