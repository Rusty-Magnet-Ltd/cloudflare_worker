import { Hono } from "hono";
import { Style } from "hono/css";
import { checkForFooHeaders } from "../model/foo-headers";
import {
  unorderedList,
  tableD,
  tableClass,
  headerClass,
  globalClass,
} from "../constants/css";
import { features } from "../constants";

const home = new Hono();

const SiteFeatures = () => {
  return (
    <div class={globalClass}>
      <br />
      <table class={tableClass}>
        <thead>
          <tr>
            <th scope="col"></th>
            <td class={tableD}>
              <b>Feature</b>
            </td>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr>
              <th class={tableD} scope="row">
                {feature.title}
              </th>
              <td class={tableD}>{feature.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

home.get("/", (c) => {
  const foos = checkForFooHeaders(c.req.raw.headers);

  return c.html(
    <html>
      <head>
        <Style />
        <header class={headerClass}>Cloudflare Worker</header>
      </head>
      <body>
        <SiteFeatures />

        <br />
        {foos.map((fh) => (
          <ul class={unorderedList}>
            {fh.name}={fh.value}
          </ul>
        ))}
      </body>
      <footer></footer>
    </html>,
  );
});

export default home;
