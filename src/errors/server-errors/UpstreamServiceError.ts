import { ServerError } from './ServerError';
import { StatusCodes } from '../../statusCodes';

export class UpstreamServiceError extends ServerError {
    failingService?: string;
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    constructor(message?: string, failingServiceName?: string) {
        super(message || 'Upstream service error');
        if (failingServiceName) {
            this.failingService = failingServiceName;
        }
    }
}
