import { Component } from "react";
import Link from "next/link";

export default class AlternateHeader extends Component {
    render() {
        return (
            <div className="alternate-header">
                <Link href="/">
                    <a>
                        <img src="/favicon.ico" />
                    </a>
                </Link>
                <span className="alternate-header-label">{this.props.displayMessage}</span>
            </div>
        );
    }
}
