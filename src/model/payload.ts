

export class SecretPayload {
    readonly name: string;
    readonly roles: string[] = ['admin'];
    readonly expiry: number = Math.floor(Date.now() / 1000) + 60 * 1;
    constructor(name: string) {
        this.name = name;
    }
    getUsername():string {
        if (this.name) {
            return this.name
        }
        return 'user\'s name not found';
    }

}


