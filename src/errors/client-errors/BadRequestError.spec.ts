import { BadRequestError } from './BadRequestError';
import { ClientError } from './ClientError';
import { CustomError } from '../CustomError';
import { ServerError } from '../server-errors';
import { StatusCodes } from '../../statusCodes';

function throwsError(message: string, data?: Record<string, unknown>) {
    if (data) {
        throw new BadRequestError(message, data);
    }
    throw new BadRequestError(message);
}

function catchesAndReturnsError(message: string, data?: Record<string, unknown>): BadRequestError | null {
    try {
        throwsError(message, data);
    } catch (err) {
        return err as BadRequestError;
    }
    return null;
}

function catchesAndThrowsError(message: string, data?: Record<string, unknown>) {
    // eslint-disable-next-line no-useless-catch
    try {
        throwsError(message, data);
    } catch (err) {
        throw err;
    }
}

describe('BadInputError', () => {
    describe('Inheritance rules', () => {
        it('is not an instance of the server error', () => {
            expect(new BadRequestError('oops!')).not.toBeInstanceOf(ServerError);
        });
        it('is an instance of BadRequestError', () => {
            expect(new BadRequestError('oops!')).toBeInstanceOf(BadRequestError);
        });
        it('is an instance of the client error', () => {
            expect(new BadRequestError('oops!')).toBeInstanceOf(ClientError);
        });
        it('is an instance of the base error', () => {
            expect(new BadRequestError('oops!')).toBeInstanceOf(CustomError);
        });
        it('is an instance of the native error', () => {
            expect(new BadRequestError('oops!')).toBeInstanceOf(Error);
        });
    });
    describe('Stack trace', () => {
        it('preserves the stack trace form returned error', () => {
            const error = catchesAndReturnsError('oops');
            expect(error?.stack?.includes('throwsError')).toBe(true);
            expect(error?.stack?.includes('catchesAndReturnsError')).toBe(true);
        });
        it('preserves the stack trace form throws error', () => {
            expect.assertions(2);
            try {
                catchesAndThrowsError('oops');
            } catch (error) {
                expect((error as BadRequestError)?.stack?.includes('throwsError')).toBe(true);
                expect((error as BadRequestError)?.stack?.includes('catchesAndThrowsError')).toBe(true);
            }
        });
    });
    describe('Error code specifics', () => {
        it('is a client error', () => {
            const error = new BadRequestError();
            expect(error.isServerError).toBe(false);
            expect(error.isClientError).toBe(true);
        });
        it('can be created with additional data showing the message and incorrect data', () => {
            const error = new BadRequestError('oops', { name: 'Peter Jones' });
            expect(error.message).toEqual('oops');
            expect(error.data).toEqual({ name: 'Peter Jones' });
        });
        it('has the expected status code and message if initialized empty', () => {
            const error = new BadRequestError();
            expect(error.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(error.message).toEqual('Bad Input');
        });
    });
});
