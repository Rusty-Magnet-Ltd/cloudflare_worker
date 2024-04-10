

export class SecretPayload {
    readonly name: string;
    roles: string[];
    exp: number;
    nbf: number;
    constructor(name: string) {
        this.name = name;
        this.roles = ['admin', 'payroll'];
        this.exp = Math.floor(Date.now() / 1000) + 60;
        this.nbf = Math.floor(Date.now() / 1000);
    }
    getUsername():string {
        if (this.name) {
            return this.name
        }
        return 'user\'s name not found';
    }

}


