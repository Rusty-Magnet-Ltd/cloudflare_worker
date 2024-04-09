import { Hono } from 'hono'
import { css, Style } from 'hono/css'
import type { FC } from 'hono/jsx'

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


home.get('/', (c) => {
    const headers = c.req.raw.headers
    console.log(headers)



    return c.html(
        <html>

        <head >
            <Style/>
            <header class={headerClass}>Cloudflare Worker</header>
        </head>
        <body>
            <SiteFeatures />

        </body>
        <footer></footer>
        </html>
    )
})

export default home