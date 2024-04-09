import { Hono } from 'hono'
import { css, Style } from 'hono/css'

const home = new Hono()


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
    const features = ['Cloudflare Worker', 'Hono tiny router', 'JSX templating engine from React' ]

    return (
        <div class={globalClass}>
            <table>
                <thead>
                <tr>
                    <th scope="col">Feature</th>
                </tr>
                </thead>
                <tbody>
                    {features.map((feature) => (
                        <tr>
                            <th scope="row">-</th>
                            <td>{feature}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


home.get('/', (c) => {
    return c.html(
        <html>

        <head>
            <Style/>
            <header>Header from Hono</header>
        </head>
        <body>
        <h3 class={headerClass}>Hono with Cloudflare Worker</h3>
            <SiteFeatures />
        </body>
        <footer>
            foioter
        </footer>
        </html>
    )
})

export default home