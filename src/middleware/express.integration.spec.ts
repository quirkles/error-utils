import express from 'express';
import request from 'supertest';

import { withErrorHandler } from './express';
import { BadRequestError } from '../errors';

describe('withErrorHandler', () => {
    it('works with no config, sync handler throws regular error', async () => {
        expect.assertions(1);
        const app = express();
        app.get('/test', (_, __) => {
            throw new Error('something went wrong');
        });

        app.use(withErrorHandler());
        const response = await request(app).get('/test').expect(500).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            error: 'something went wrong',
        });
    });
    it('works with no config, sync handler throws custom client error', async () => {
        expect.assertions(1);
        const app = express();
        app.get('/test', (_, __) => {
            throw new BadRequestError('something went wrong');
        });

        app.use(withErrorHandler());
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            error: 'something went wrong',
        });
    });
    it('works with an error handler, sync handler throws custom client error', async () => {
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const withError = jest.fn();

        app.use(withErrorHandler({ withError }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            error: 'something went wrong',
        });

        expect(withError).toHaveBeenCalledWith(error);
    });
    it('works with an error handler that throws an error itself, sync handler throws custom client error', async () => {
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const withError = jest.fn(() => {
            throw new Error();
        });

        app.use(withErrorHandler({ withError }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            error: 'something went wrong',
        });

        expect(withError).toHaveBeenCalledWith(error);
    });
    it('works with an return value that formats the response, sync handler throws custom client error', async () => {
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const returnValue = jest.fn((err) => {
            return {
                message: err.message,
                type: err.constructor.name,
            };
        });

        app.use(withErrorHandler({ returnValue }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            message: 'something went wrong',
            type: 'BadRequestError',
        });

        expect(returnValue).toHaveBeenCalledWith(error);
    });
    it('works with a constant return value that, sync handler throws custom client error', async () => {
        expect.assertions(1);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const returnValue = { message: 'hello' };

        app.use(withErrorHandler({ returnValue }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({ message: 'hello' });
    });
    it('works with an return value that throws an error, sync handler throws custom client error', async () => {
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const returnValue = jest.fn(() => {
            throw new Error();
        });

        app.use(withErrorHandler({ returnValue }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            error: 'something went wrong',
        });

        expect(returnValue).toHaveBeenCalledWith(error);
    });
    it('works with an async return value function, sync handler throws custom client error', async () => {
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('something went wrong');
        app.get('/test', (_, __) => {
            throw error;
        });

        const returnValue = jest.fn((err) => {
            return Promise.resolve({
                errorType: err.constructor.name,
                whatWentWrong: err.message,
            });
        });

        app.use(withErrorHandler({ returnValue: returnValue as any }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            errorType: 'BadRequestError',
            whatWentWrong: 'something went wrong',
        });

        expect(returnValue).toHaveBeenCalledWith(error);
    });
    it('works with an async return value function, async handler throws custom client error', async () => {
        // this test demonstrates the middleware handling an appropriately wrapped async route handler
        // The implementation of the async error handler is up to the writer of the application, this is one popular pattern
        expect.assertions(2);
        const app = express();
        const error = new BadRequestError('oh dear!');

        const asyncHandler =
            (fn: express.RequestHandler) =>
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                return Promise.resolve(fn(req, res, next)).catch(next);
            };

        app.get(
            '/test',
            asyncHandler((_, __) => {
                return Promise.reject(error);
            }),
        );

        const returnValue = jest.fn((err) => {
            return Promise.resolve({
                newErrorTypeField: err.constructor.name,
                theMessage: err.message,
            });
        });

        app.use(withErrorHandler({ returnValue: returnValue as any }));
        const response = await request(app).get('/test').expect(400).expect('Content-Type', /json/);
        expect(response.body).toEqual({
            newErrorTypeField: 'BadRequestError',
            theMessage: 'oh dear!',
        });

        expect(returnValue).toHaveBeenCalledWith(error);
    });
});
