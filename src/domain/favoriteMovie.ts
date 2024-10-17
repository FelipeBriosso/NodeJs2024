import { DomainError } from "../utils/errors";

export class FavoriteMovie {
    public addedAt: Date;
    constructor(
        public id: number,
        public title:string,
        public userEmail: string,
    ) {
        this.addedAt = new Date();
        if (!id) {
            throw new DomainError("Movie id is required");
        }
        if(!title){
            throw new DomainError("Movie title is required");
        }
        if (!userEmail) {
            throw new DomainError("A valid user email is required");
        }
    }

}
