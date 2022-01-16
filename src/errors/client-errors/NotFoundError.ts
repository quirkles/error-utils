import { ClientError } from './ClientError';
import { StatusCodes } from '../../statusCodes';

export class NotFoundError extends ClientError {
    statusCode = StatusCodes.NOT_FOUND;
    constructor(message?: string) {
        super(message || 'Resource not found');
    }
}
