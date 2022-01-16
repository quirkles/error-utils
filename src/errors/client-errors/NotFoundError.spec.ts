import { NotFoundError } from './NotFoundError';
import { ClientError } from './ClientError';
import { CustomError } from '../CustomError';
import { ServerError } from '../server-errors/ServerError';
import { StatusCodes } from '../../statusCodes';

function throwsError(message: string) {
    throw new NotFoundError(message);
}

function catchesAndReturnsError(message: string): NotFoundError | null {
    try {
        throwsError(message);
    } catch (err) {
        return err as NotFoundError;
    }
    return null;
}

function catchesAndThrowsError(message: string) {
    // eslint-disable-next-line no-useless-catch
    try {
        throwsError(message);
    } catch (err) {
        throw err;
    }
}

describe('NotFoundError', () => {
    describe('Inheritance rules', () => {
        it('is not an instance of the server error', () => {
            expect(new NotFoundError('oops!')).not.toBeInstanceOf(ServerError);
        });
        it('is an instance of NotFoundError', () => {
            expect(new NotFoundError('oops!')).toBeInstanceOf(NotFoundError);
        });
        it('is an instance of the client error', () => {
            expect(new NotFoundError('oops!')).toBeInstanceOf(ClientError);
        });
        it('is an instance of the base error', () => {
            expect(new NotFoundError('oops!')).toBeInstanceOf(CustomError);
        });
        it('is an instance of the native error', () => {
            expect(new NotFoundError('oops!')).toBeInstanceOf(Error);
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
                expect((error as NotFoundError)?.stack?.includes('throwsError')).toBe(true);
                expect((error as NotFoundError)?.stack?.includes('catchesAndThrowsError')).toBe(true);
            }
        });
    });
    describe('Error code specifics', () => {
        it('is a client error', () => {
            const error = new NotFoundError();
            expect(error.isServerError).toBe(false);
            expect(error.isClientError).toBe(true);
        });
        it('can be created with message', () => {
            const error = new NotFoundError('oops');
            expect(error.message).toEqual('oops');
        });
        it('has the expected status code and message if initialized empty', () => {
            const error = new NotFoundError();
            expect(error.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(error.message).toEqual('Resource not found');
        });
    });
});
