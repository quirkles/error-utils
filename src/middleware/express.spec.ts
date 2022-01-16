import type { Request, Response } from 'express';
import { withErrorHandler } from './express';
import { BadRequestError } from '../errors/client-errors/BadRequestError';
import { UpstreamServiceError } from '../errors/server-errors/UpstreamServiceError';

const getMockRes = (): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
        status: jest.fn(() => self),
        json: jest.fn(() => self),
    };
};

describe('express middleware', () => {
    describe('default configuration', () => {
        it('standard js error', () => {
            const middleware = withErrorHandler();
            const mockResponse: Response = getMockRes() as Response;
            const error = new Error('oops');
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'oops' });
        });
        it('custom client error', () => {
            const middleware = withErrorHandler();
            const mockResponse: Response = getMockRes() as Response;
            const error = new BadRequestError('oops', { data: 'yes' });
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'oops' });
            expect(next).not.toHaveBeenCalled();
        });
        it('custom server error', () => {
            const middleware = withErrorHandler();
            const mockResponse: Response = getMockRes() as Response;
            const error = new UpstreamServiceError('oops', 'authorization service');
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'oops' });
            expect(next).not.toHaveBeenCalled();
        });
        it('bails early if res.headersSent is true', () => {
            const middleware = withErrorHandler();
            const mockResponse: Response = getMockRes() as Response;
            mockResponse.headersSent = true;
            const error = new UpstreamServiceError('oops', 'authorization service');
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe('with custom error handling function', () => {
        it('standard js error', () => {
            const withError = jest.fn();
            const error = new Error('oops');
            const middleware = withErrorHandler({
                withError: withError as any,
            });
            const mockResponse: Response = getMockRes() as Response;
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(withError).toHaveBeenCalledWith(error);
        });
        it('works with no arguments, custom client error', () => {
            const withError = jest.fn();
            const error = new BadRequestError('oops', { thing: true });
            const middleware = withErrorHandler({
                withError: withError as any,
            });
            const mockResponse: Response = getMockRes() as Response;
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(withError).toHaveBeenCalledWith(error);
        });
        it('works with no arguments, custom server error', () => {
            const withError = jest.fn();
            const error = new UpstreamServiceError('oops', 'google');
            const middleware = withErrorHandler({
                withError: withError as any,
            });
            const mockResponse: Response = getMockRes() as Response;
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(withError).toHaveBeenCalledWith(error);
        });
    });
    describe('custom return value', () => {
        it('constant', () => {
            const returnValue = 'this is the returned message!';
            const error = new Error('oops');
            const middleware = withErrorHandler({
                returnValue: returnValue as any,
            });
            const mockResponse: Response = getMockRes() as Response;
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(mockResponse.json).toHaveBeenCalledWith(returnValue);
        });
        it('function', () => {
            const returnValue = jest.fn();
            const error = new Error('oops');
            const middleware = withErrorHandler({
                returnValue: returnValue as any,
            });
            const mockResponse: Response = getMockRes() as Response;
            const next = jest.fn();
            middleware(error, {} as Request, mockResponse, next);
            expect(returnValue).toHaveBeenCalledWith(error);
        });
    });
});
