import { Component } from "react"

export default class Header extends Component {
    render() {
        return (
          <table className="header-wrapper">
            <tbody>
              <tr>
                <td className="header-logo">
                  <a href="/">
                    <img src="/favicon.ico" />
                  </a>
                </td>
                <td className="header-links">
                  <span className="header-links-items">
                    <b className="header-links-name">
                      <a href="/news">Coder News</a>
                    </b>
                    <a className={this.props.pageName === "newest" ? "white-text" : null} href="/newest">new</a>
                    <span> | </span>
                    {
                      this.props.userSignedIn ?
                        <>
                          <a className={this.props.pageName === "threads" ? "white-text" : null} href={`/threads?id=${this.props.username}`}>threads</a>
                          <span> | </span>
                        </> : null
                    }
                    <a href="/past">past</a>
                    <span> | </span>
                    <a className={this.props.pageName === "newcomments" ? "white-text" : null} href="/newcomments">comments</a>
                    <span> | </span>
                    <a className={this.props.pageName === "ask" ? "white-text" : null} href="/ask">ask</a>
                    <span> | </span>
                    <a className={this.props.pageName === "show" ? "white-text" : null} href="/show">show</a>
                    <span> | </span>
                    <a className={this.props.pageName === "submit" ? "white-text" : null} href="/submit">submit</a>
                    {
                      this.props.label ?
                        <>
                          <span> | </span>
                          <span className="white-text">{this.props.label}</span>
                        </> : null
                    }
                  </span>
                </td>
                <td className="header-right-nav-links">
                  <span className="header-right-nav-links-items">
                    <a href={`/login${this.props.goto ? "?goto=" + encodeURIComponent(this.props.goto) : ""}`}>
                      <span>login</span>
                    </a>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )
    }
}
