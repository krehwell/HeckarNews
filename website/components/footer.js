import { Component } from "react"

export default class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInputValue: ""
        }
    }

    updateSearchInputValue = (event) => {
        this.setState({
            searchInputValue: event.target.value
        });
    }

    listenForEnterKeyPress = (event) => {
        if (event.keyCode === 13 && this.state.searchInputValue) {
            window.location.href = `/search?q=${this.state.searchInputValue}`;
        }
    }

    render() {
        return (
          <div className="footer-wrapper">
            <div className="footer-link-list">
              <div className="footer-link-list-item">
                <a href="/newsguidelines">
                  <span>Guidelines</span>
                </a>
              </div>
              <div className="footer-link-list-item">
                <span>|</span>
              </div>
              <div className="footer-link-list-item">
                <a href="/newsfaq">
                  <span>FAQ</span>
                </a>
              </div>
              <div className="footer-link-list-item">
                <span>|</span>
              </div>
              <div className="footer-link-list-item">
                <a href="mailto:support@codernews.com">
                  <span>Contact</span>
                </a>
              </div>
            </div>

           <div className="footer-search">
             <span className="footer-search-label">Search:</span>
             <input
               className="footer-search-input"
               type="text"
               value={this.state.searchInputValue}
               onChange={this.updateSearchInputValue}
               onKeyDown={this.listenForEnterKeyPress}
             />
           </div>
          </div>
        )
    }
}
