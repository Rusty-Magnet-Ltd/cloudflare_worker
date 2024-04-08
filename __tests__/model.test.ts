import { expect, it, describe } from 'vitest'
import {newPayload} from "../src/model/payload";


describe('test creating payload', () => {
    const actor = "Tom Hanks"
    it(`with name of ${actor}`, () => {
        const payload = newPayload(actor);
        expect(payload.name === actor);
    })
    it(`with no name and default`, () => {
        const payload = newPayload();
        expect(payload.name === "bob");
    })
})