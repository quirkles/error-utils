import { CustomError } from '../CustomError';
import { StatusCodes } from '../../statusCodes';

export abstract class ServerError extends CustomError {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    public isServerError = true;
    public isClientError = false;
}
