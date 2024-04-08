
type SecretPayload = {
    name: string;
    roles: string[];
    expiry: number;
}

export function newPayload(user="bob"): SecretPayload {

    const payload: SecretPayload = {
        name: user,
        roles: ['admin'],
        expiry: Math.floor(Date.now() / 1000) + 60 * 1,
    };

    return payload;

}

