import { ClientError } from './ClientError';
import { StatusCodes } from '../../statusCodes';

export class ForbiddenError extends ClientError {
    statusCode = StatusCodes.FORBIDDEN;
    constructor(message?: string) {
        super(message || 'Forbidden');
    }
}
