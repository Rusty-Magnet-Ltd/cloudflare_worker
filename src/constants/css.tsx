import { css, Style } from 'hono/css'

export const tableClass = css`
    border-collapse: collapse;
    border: 2px solid rgb(140 140 140);
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
    `
export const tableD = css `
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
`
export const unorderedList = css `
    background: orange;
    color: darkblue;
    margin: 5px;
    padding: 8px 10px;
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
`

export const headerClass = css`
    background-color: orange;
    color: white;
    font-size: 2.0rem;
    padding: 1rem;
    `

export const globalClass = css`
    :-hono-global {
        html {
            font-family: Arial, Helvetica, sans-serif;
        }
    }
`