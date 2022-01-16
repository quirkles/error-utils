import { CustomError } from '../CustomError';
import { StatusCodes } from '../../statusCodes';

export abstract class ClientError extends CustomError {
    statusCode = StatusCodes.BAD_REQUEST;
    public isClientError = true;
    public isServerError = false;
}
