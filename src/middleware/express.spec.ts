import type { Request, Response } from 'express';
import { withErrorHandler } from './express';

const getMockRes = (): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
        status: jest.fn(() => self),
        json: jest.fn(() => self),
    };
};

describe('express middleware', () => {
    it('works with no arguments, standard js error', () => {
        const middleware = withErrorHandler();
        const mockResponse: Response = getMockRes() as Response;
        const error = new Error('oops');
        const next = jest.fn();
        middleware(error, {} as Request, mockResponse, next);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'oops' });
    });
});
