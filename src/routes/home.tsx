import { Hono } from 'hono'
import { css, Style } from 'hono/css'
import {checkForFooHeaders, FooHeader} from "../model/foo-headers";

const home = new Hono()

const tableClass = css`
    border-collapse: collapse;
    border: 2px solid rgb(140 140 140);
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
    `
const tableD = css `
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
`
const unorderedList = css `
    background: orange;
    color: darkblue;
    margin: 5px;
    padding: 8px 10px;
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
`

const headerClass = css`
    background-color: orange;
    color: white;
    padding: 2rem;
    `
const globalClass = css`
    :-hono-global {
        html {
            font-family: Arial, Helvetica, sans-serif;
        }
    }
`
const features = [{
        title: 'hono',
        description: 'Tiny and lightweight',
    }, {
        title: "wrangler",
        description: 'Simple cli tool to deploy to Cloudflare',
    },{
        title: "JWT",
        description: 'For /generate and /verify',
    }]

const SiteFeatures = () => {
    return (
        <div class={globalClass}>
            <br/>
            <table class={tableClass}>
                <thead>
                <tr>
                    <th scope="col"></th>
                    <td class={tableD}><b>Feature</b></td>
                </tr>
                </thead>
                <tbody>
                    {features.map((feature) => (
                        <tr>
                            <th class={tableD} scope="row">{feature.title}</th>
                            <td class={tableD}>{feature.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


home.get('/', (c) => {
    const foos = checkForFooHeaders(c.req.raw.headers)

    return c.html(
        <html>
        <head>
            <Style/>
            <header class={headerClass}>Cloudflare Worker</header>
        </head>
        <body>
        <SiteFeatures/>

        <br/>
        {foos.map((fh) => (
            <ul class={unorderedList}>{fh.name}={fh.value}</ul>
        ))}

        </body>
        <footer></footer>
        </html>
    )
})

export default home