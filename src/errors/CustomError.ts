import { StatusCodes } from '../statusCodes';

export abstract class CustomError extends Error {
    data?: Record<string, unknown>;
    statusCode?: StatusCodes;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}
