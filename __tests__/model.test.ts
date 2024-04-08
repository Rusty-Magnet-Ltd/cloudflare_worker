import { expect, it, describe } from 'vitest'
import {SecretPayload} from "../src/model/payload";


describe('test creating payload', () => {
    const actor = "Tom Hanks"
    const payload = new SecretPayload(actor)
    it(`name ${actor} ok`, () => {
        expect(payload.name === actor);
    })
    it(`name validation ok`, () => {
        expect(payload.getUsername() === actor);
    })
})

