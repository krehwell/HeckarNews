import { Component } from "react";
import Head from "next/head";

export default class HeadMetadata extends Component {
    render() {
        return (
            <Head>
                <title>{this.props.title}</title>
                <meta  name="description" content={this.props.description} />
                <title>{this.props.title}</title>
                <meta
                    name="description"
                    content={this.props.description}
                />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
        )
    }
}
