import { DomainError } from "../utils/errors";

export class User{
    constructor(
        public email: string,
        public password: string,
        public firstname: string,
        public lastname: string
    ) {

        if (!this.isValidEmail(this.email)) {
            throw new DomainError('Invalid email address');
        }
        if (!this.isValidPassword(this.password)) {
            throw new DomainError('Password is invalid');
        }
        if (!this.isValidName(this.firstname)) {
            throw new DomainError('First name is required');
        }
        if (!this.isValidName(this.lastname)) {
            throw new DomainError('last name is required');
        }
    }

    isValidPassword(password: string) {
    return password.length >= 8 
    && /\d/.test(password) 
    && /[A-Z]/.test(password);
    }
    isValidName(name: string) {
        return name !=="";
    }
    private isValidEmail(email: string): boolean {
        return email.length > 8 && email.includes('@');
    }
}