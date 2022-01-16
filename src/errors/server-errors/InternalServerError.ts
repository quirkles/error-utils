import { ServerError } from './ServerError';
import { StatusCodes } from '../../statusCodes';

export class InternalServerError extends ServerError {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    constructor(message?: string) {
        super(message || 'Internal Server Error');
    }
}
