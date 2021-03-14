import { Component } from "react"

export default class AlternateHeader extends Component {
    render() {
        return (
          <div className="alternate-header">
            <a href="/">
              <img src="/coder-news-icon.png" />
            </a>
            <span className="alternate-header-label"> {this.props.displayMessage}</span>
          </div>
        )
    }
}
