export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }  
}

export class LogicError extends Error {
    constructor(message: string){
        super(message);
        this.name ='LogicError';
    }
}