import { InternalServerError } from './InternalServerError';
import { ServerError } from './ServerError';
import { CustomError } from '../CustomError';
import { StatusCodes } from '../../statusCodes';
import { ClientError } from '../client-errors/ClientError';

function throwsError(message: string) {
    throw new InternalServerError(message);
}

function catchesAndReturnsError(message: string): InternalServerError | null {
    try {
        throwsError(message);
    } catch (err) {
        return err as InternalServerError;
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

describe('InternalServerError', () => {
    describe('Inheritance rules', () => {
        it('is an instance of the server error', () => {
            expect(new InternalServerError('oops!')).toBeInstanceOf(ServerError);
        });
        it('is an instance of InternalServerError', () => {
            expect(new InternalServerError('oops!')).toBeInstanceOf(InternalServerError);
        });
        it('is not an instance of the client error', () => {
            expect(new InternalServerError('oops!')).not.toBeInstanceOf(ClientError);
        });
        it('is an instance of the base error', () => {
            expect(new InternalServerError('oops!')).toBeInstanceOf(CustomError);
        });
        it('is an instance of the native error', () => {
            expect(new InternalServerError('oops!')).toBeInstanceOf(Error);
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
                expect((error as InternalServerError)?.stack?.includes('throwsError')).toBe(true);
                expect((error as InternalServerError)?.stack?.includes('catchesAndThrowsError')).toBe(true);
            }
        });
    });
    describe('Error code specifics', () => {
        it('is a client error', () => {
            const error = new InternalServerError();
            expect(error.isServerError).toBe(true);
            expect(error.isClientError).toBe(false);
        });
        it('can be created with message', () => {
            const error = new InternalServerError('oops');
            expect(error.message).toEqual('oops');
        });
        it('has the expected status code and message if initialized empty', () => {
            const error = new InternalServerError();
            expect(error.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(error.message).toEqual('Internal Server Error');
        });
    });
});
