import { DomainError } from "../utils/errors";

export class FavoriteMovie {
    public addedAt: Date;
    constructor(
        public id: number,
        public ownScore: number,
        public userEmail: string,
    ) {
        this.addedAt = new Date();
        if (!id) {
            throw new DomainError("Movie id is required");
        }
        if (ownScore<0 || ownScore >=100) {
            throw new DomainError("own score must be a valid number");
        }else{
            console.log(ownScore);
        }
        if (!userEmail) {
            throw new DomainError("A valid user email is required");
        }
    }

}
