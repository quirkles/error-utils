import { UpstreamServiceError } from './UpstreamServiceError';
import { ServerError } from './ServerError';
import { CustomError } from '../CustomError';
import { StatusCodes } from '../../statusCodes';
import { ClientError } from '../client-errors/ClientError';

function throwsError(message: string) {
    throw new UpstreamServiceError(message);
}

function catchesAndReturnsError(message: string): UpstreamServiceError | null {
    try {
        throwsError(message);
    } catch (err) {
        return err as UpstreamServiceError;
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

describe('UpstreamServiceError', () => {
    describe('Inheritance rules', () => {
        it('is an instance of the server error', () => {
            expect(new UpstreamServiceError('oops!')).toBeInstanceOf(ServerError);
        });
        it('is an instance of UpstreamServiceError', () => {
            expect(new UpstreamServiceError('oops!')).toBeInstanceOf(UpstreamServiceError);
        });
        it('is not an instance of the client error', () => {
            expect(new UpstreamServiceError('oops!')).not.toBeInstanceOf(ClientError);
        });
        it('is an instance of the base error', () => {
            expect(new UpstreamServiceError('oops!')).toBeInstanceOf(CustomError);
        });
        it('is an instance of the native error', () => {
            expect(new UpstreamServiceError('oops!')).toBeInstanceOf(Error);
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
                expect((error as UpstreamServiceError)?.stack?.includes('throwsError')).toBe(true);
                expect((error as UpstreamServiceError)?.stack?.includes('catchesAndThrowsError')).toBe(true);
            }
        });
    });
    describe('Error code specifics', () => {
        it('is a client error', () => {
            const error = new UpstreamServiceError();
            expect(error.isServerError).toBe(true);
            expect(error.isClientError).toBe(false);
        });
        it('can be created with message', () => {
            const error = new UpstreamServiceError('oops');
            expect(error.message).toEqual('oops');
        });
        it('has the expected status code and message if initialized empty', () => {
            const error = new UpstreamServiceError();
            expect(error.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(error.message).toEqual('Upstream service error');
        });
        it('allows setting an optional service', () => {
            const error = new UpstreamServiceError('dang!', 'captcha service');
            expect(error.message).toEqual('dang!');
            expect(error.failingService).toEqual('captcha service');
        });
    });
});
