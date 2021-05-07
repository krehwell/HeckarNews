import { Component } from "react"

import HeadMetadata from "../components/headMetadata.js"

export default class extends Component {
    render () {
        return (
          <div className="error-wrapper">
            <HeadMetadata title="Error | HeckarNews" />
            <span>An error occurred. (ERROR: 500)</span>
          </div>
        )
    }
}
