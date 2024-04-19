import { expect, it, describe } from "vitest";
import { SecretPayload } from "../src/model/payload";
import { checkForFooHeaders, FooHeader } from "../src/model/foo-headers";

const actor = "Tom Hanks";
describe("test creating payload", () => {
  const payload = new SecretPayload(actor);
  it(`name ${actor} ok`, () => {
    expect(payload.name === actor);
  });
  it(`name validation ok`, () => {
    expect(payload.getUsername() === actor);
  });
});

describe("test foo headers interface", () => {
  const header: FooHeader = {
    name: actor,
    value: "moon expert",
  };
  it(`check header inits ok`, () => {
    expect(header.name == actor);
  });

  it(`create map of headers and check find headers with foo prefix`, () => {
    const allHeaders: Headers = new Headers();
    allHeaders.append("Content-Type", "application/json");
    allHeaders.append("Cookie", "This is a demo cookie");
    allHeaders.append("compression", "gzip");
    allHeaders.append("foo-boo", "foobar");
    const fooHeaders = checkForFooHeaders(allHeaders);
    expect(fooHeaders).toHaveLength(1);
  });
});
