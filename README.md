# What?

A collection of utilities for creating and handling custom errors in javascript applications, with a focus on server side code.

These errors attempt to conform to the HTTP standard outlined [here](https://datatracker.ietf.org/doc/html/rfc7231#section-6.2.1)

## Custom Errors

These extend the base Error and append some additional data, providing default error messages.

### Client Errors

Errors indicating a mistake on the client side:

#### BadRequestError

Error indicating a malformed request:

> The 400 (Bad Request) status code indicates that the server cannot or
will not process the request due to something that is perceived to be
a client error (e.g., malformed request syntax, invalid request
message framing, or deceptive request routing).

```typescript
const error1 = new BadRequestError()
console.log(error.statusCode) // 400
//..
throw new BadRequestError()
throw new BadRequestError('Oh no!') // custom error message
// ..
const error2 = new BadRequestError('Oh no!', {message: 'invalid text!'}) // thrown error can contain additional data for context
console.log(error2.data) // {message: 'invalid text!'}
```

#### ForbiddenError

>    The 403 (Forbidden) status code indicates that the server understood
the request but refuses to authorize it.  A server that wishes to
make public why the request has been forbidden can describe that
reason in the response payload (if any).
>
> If authentication credentials were provided in the request, the
server considers them insufficient to grant access.  The client
SHOULD NOT automatically repeat the request with the same
credentials.  The client MAY repeat the request with new or different
credentials.  However, a request might be forbidden for reasons
unrelated to the credentials.
>
>An origin server that wishes to "hide" the current existence of a
forbidden target resource MAY instead respond with a status code of
404 (Not Found).

```typescript
throw new ForbiddenError()
throw new ForbiddenError('Oh no!') // custom error message

const error = new ForbiddenError()
console.log(error.statusCode) // 403
console.log(error.isClientError) // true
console.log(error.isServerError) // false
```

#### NotFoundError
>    The 404 (Not Found) status code indicates that the origin server did
not find a current representation for the target resource or is not
willing to disclose that one exists.  A 404 status code does not
indicate whether this lack of representation is temporary or
permanent; the 410 (Gone) status code is preferred over 404 if the
origin server knows, presumably through some configurable means, that
the condition is likely to be permanent.

```typescript
throw new NotFoundError()
throw new NotFoundError('Oh no!') // custom error message
```

#### UnauthorizedError
> The 401 (Unauthorized) status code indicates that the request has not
been applied because it lacks valid authentication credentials for
the target resource.  The server generating a 401 response MUST send
a WWW-Authenticate header field (Section 4.1) containing at least one
challenge applicable to the target resource.
>
> If the request included authentication credentials, then the 401
response indicates that authorization has been refused for those
credentials.  The user agent MAY repeat the request with a new or
replaced Authorization header field (Section 4.2).  If the 401
response contains the same challenge as the prior response, and the
user agent has already attempted authentication at least once, then
the user agent SHOULD present the enclosed representation to the
user, since it usually contains relevant diagnostic information.

```typescript
throw new UnauthorizedError()
throw new UnauthorizedError('Oh no!') // custom error message
```

### Server Errors

Errors indicating a mistake on the server side:

#### InternalServerError

The generic server error

>   The 501 (Not Implemented) status code indicates that the server does
not support the functionality required to fulfill the request.  This
is the appropriate response when the server does not recognize the
request method and is not capable of supporting it for any resource.

```typescript
throw new InternalServerError()
throw new InternalServerError('Oh no!') // custom error message

const error = new InternalServerError()
console.log(error.isClientError) // false
console.log(error.isServerError) // true
```

#### UpstreamServerError

This doesn't directly correspond to the spec. The statusCode is 500, but it allows you to set the name of the service that's failing. This may be useful for logging purposes.

```typescript
throw new UpstreamServerError()
throw new UpstreamServerError('Oh no!') // custom error message

const error = new UpstreamServerError('oops', 'captchaService')
console.log(error.failingService) // captchaService
```

## Middleware

Error handling middleware for express applications, use like:

```typescript
const express = require('express')
const {withErrorHandler} = require('./src/middleware/express')
const app = express()
const port = 3000

app.use(withErrorHandler())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
```

the middleware will by default return a json response:
```json
{ "error" : "the error message"}
```
with the status code if one is set.

The middleware can be configured with a `returnValue` parameter that can either be any serializable constant, or a function that accepts the error and returns a serializable constant:

```javascript
const errorHandler = withErrorHandler({
  // parse the error and return this is something goes wrong
  returnValue: error => ({
    message: error.message,
    stack: error.stack,
    isSuccess: false
  })
})

  // return a single error message no matter what!
const errorHanl=dler = withErrorHandler({
  // parse the error and return this is something goes wrong
  returnValue: "you messed up!"
})
```

The middleware can also accept a `withError` function, this lets you do some arbitrary thing with the error before returning.

```javascript
function errorLogger(error) {
  if(error instanceof UpstreamServerError) {
    logger.error(`Upstream service failed: ${error.failingService || 'Unknown Service'}`)
  }
}

const errorHandler = withErrorHandler({
  // parse the error and return this is something goes wrong
  withError: errorLogger
})
```

`withError` can also be async

```javascript
async function errorLogger(error) {
  if(error instanceof UpstreamServerError) {
    await notify(`Upstream service failed: ${error.failingService || 'Unknown Service'}`)
  }
}

const errorHandler = withErrorHandler({
  // parse the error and return this is something goes wrong
  withError: errorLogger
})
```
