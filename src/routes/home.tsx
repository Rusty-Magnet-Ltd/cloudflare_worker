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
const headerClass = css`
    background-color: orange;
    color: white;
    padding: 1rem;
    `
const globalClass = css`
    :-hono-global {
        html {
            font-family: Arial, Helvetica, sans-serif;
        }
    }
`

const SiteFeatures = () => {
    const features = [{
        title: "hono",
        description: 'Tiny and lightweight',
    }, {
        title: "wrangler",
        description: 'Simple deploy with CI/CD to Cloudflare',
    },{
        title: "JWT",
        description: 'For /generate and /verify',
    }]

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

const FooHeaders = ({ fooHeaders }) => {
    const numbers = ['one', 'two', 'three']

    return (
        <div>
            {fooHeaders.map((fh) => (
                <h1>here{fh.name}{fh.value}</h1>
            ))}
        </div>
    )

    //
}

home.get('/', (c) => {
    const fooHeaders = checkForFooHeaders(c.req.raw.headers)

    return c.html(
        <html>

        <head >
            <Style/>
            <header class={headerClass}>Cloudflare Worker</header>
        </head>
        <body>

        <FooHeaders fooHeaders={fooHeaders}/>
        <SiteFeatures/>


        </body>
        <footer></footer>
        </html>
    )
})

export default home