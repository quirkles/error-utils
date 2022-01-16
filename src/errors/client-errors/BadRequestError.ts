import { ClientError } from './ClientError';
import { StatusCodes } from '../../statusCodes';

export class BadRequestError extends ClientError {
    statusCode = StatusCodes.BAD_REQUEST;
    data: Record<string, unknown> = {};
    constructor(message?: string, data?: Record<string, unknown>) {
        super(message || 'Bad Input');
        if (data) {
            this.data = {
                ...this.data,
                ...data,
            };
        }
    }
}
