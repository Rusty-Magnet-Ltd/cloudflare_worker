import { expect, it, describe } from 'vitest'
import {SecretPayload} from "../src/model/payload";
import {FooHeader} from "../src/model/foo-headers";

const actor = "Tom Hanks"
describe('test creating payload', () => {

    const payload = new SecretPayload(actor)
    it(`name ${actor} ok`, () => {
        expect(payload.name === actor);
    })
    it(`name validation ok`, () => {
        expect(payload.getUsername() === actor);
    })
})



describe('test foo headers interface', () => {
    const header: FooHeader = {
        name: actor,
        value: "moon expert"
    }
    it(`check header inits ok`, () => {
        expect(header.name == actor);
    })
})