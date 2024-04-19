export function checkForFooHeaders(headers: Headers): FooHeader[] {
  const fooHeaders: FooHeader[] = [];
  headers.forEach((value, key) => {
    if (key.startsWith("foo")) {
      const temp: FooHeader = {
        name: key,
        value: value,
      };
      fooHeaders.push(temp);
    }
  });

  return fooHeaders;
}

export interface FooHeader {
  name: string;
  value: string;
}
