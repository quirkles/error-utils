import type { ErrorRequestHandler, NextFunction, Response, Request } from 'express';
import { CustomError } from '../errors/CustomError';

type GetReturnValueFromError = (err: Error | CustomError) => Record<string, unknown>;

interface ErrorHandlerMiddlewareConfig {
    withError?(err: Error): void | Promise<void>;
    returnValue?: GetReturnValueFromError | Record<string, unknown>;
}

export function withErrorHandler(config?: ErrorHandlerMiddlewareConfig): ErrorRequestHandler {
    return async function errorHandler(error: Error | CustomError, req: Request, res: Response, next: NextFunction) {
        if (res.headersSent) {
            // if the headers have been sent we need to delegate to the express default error handler
            return next(error);
        }
        if (config?.withError && typeof config.withError === 'function') {
            try {
                // explicitly set null context for security
                const result = config.withError.call(null, error);
                if (result && result.constructor.name.toLowerCase() === 'promise') {
                    await result;
                }
            } catch {}
        }
        let statusCode = 500;
        if (error instanceof CustomError) {
            statusCode = error.statusCode || statusCode;
        }
        res.status(statusCode);

        let returnValue: Record<string, unknown> = {
            error: error.message,
        };

        if (config?.returnValue) {
            if (typeof config?.returnValue === 'function') {
                try {
                    returnValue = config.returnValue.call(null, error);
                    if (returnValue && returnValue.constructor.name.toLowerCase() === 'promise') {
                        returnValue = await returnValue;
                    }
                } catch (err) {
                    console.log(err) //eslint-disable-line
                }
            } else {
                returnValue = config.returnValue;
            }
        }

        return res.json(returnValue);
    };
}
