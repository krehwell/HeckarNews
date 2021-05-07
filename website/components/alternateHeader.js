import { Component } from "react";

export default class AlternateHeader extends Component {
    render() {
        return (
            <div className="alternate-header">
                <a href="/">
                    <img src="/favicon.ico" />
                </a>
                <span className="alternate-header-label">
                    {this.props.displayMessage}
                </span>
            </div>
        );
    }
}
