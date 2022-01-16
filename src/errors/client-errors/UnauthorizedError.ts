import { ClientError } from './ClientError';
import { StatusCodes } from '../../statusCodes';

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7235#section-3.1
 *
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
 */

export class UnauthorizedError extends ClientError {
    statusCode = StatusCodes.UNAUTHORIZED;
    constructor(message?: string) {
        super(message || 'Unauthorized');
    }
}
