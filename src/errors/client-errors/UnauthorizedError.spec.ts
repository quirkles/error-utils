import { UnauthorizedError } from './UnauthorizedError';
import { ClientError } from './ClientError';
import { CustomError } from '../CustomError';
import { ServerError } from '../server-errors';
import { StatusCodes } from '../../statusCodes';

function throwsError(message: string) {
    throw new UnauthorizedError(message);
}

function catchesAndReturnsError(message: string): UnauthorizedError | null {
    try {
        throwsError(message);
    } catch (err) {
        return err as UnauthorizedError;
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

describe('UnauthorizedError', () => {
    describe('Inheritance rules', () => {
        it('is not an instance of the server error', () => {
            expect(new UnauthorizedError('oops!')).not.toBeInstanceOf(ServerError);
        });
        it('is an instance of UnauthorizedError', () => {
            expect(new UnauthorizedError('oops!')).toBeInstanceOf(UnauthorizedError);
        });
        it('is an instance of the client error', () => {
            expect(new UnauthorizedError('oops!')).toBeInstanceOf(ClientError);
        });
        it('is an instance of the base error', () => {
            expect(new UnauthorizedError('oops!')).toBeInstanceOf(CustomError);
        });
        it('is an instance of the native error', () => {
            expect(new UnauthorizedError('oops!')).toBeInstanceOf(Error);
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
                expect((error as UnauthorizedError)?.stack?.includes('throwsError')).toBe(true);
                expect((error as UnauthorizedError)?.stack?.includes('catchesAndThrowsError')).toBe(true);
            }
        });
    });
    describe('Error code specifics', () => {
        it('is a client error', () => {
            const error = new UnauthorizedError();
            expect(error.isServerError).toBe(false);
            expect(error.isClientError).toBe(true);
        });
        it('can be created with message', () => {
            const error = new UnauthorizedError('oops');
            expect(error.message).toEqual('oops');
        });
        it('has the expected status code and message if initialized empty', () => {
            const error = new UnauthorizedError();
            expect(error.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
            expect(error.message).toEqual('Unauthorized');
        });
    });
});
