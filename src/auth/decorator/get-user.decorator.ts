import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// A custom decorator that retrieves the user object from the request object.
export const GetUser = createParamDecorator(
  // The decorator function itself, which takes in some arguments.
  (data: string | undefined, ctx: ExecutionContext) => {
    // Retrieve the Express request object from the Nest.js execution context.
    const request: Express.Request = ctx.switchToHttp().getRequest();

    // If a property name is provided, return only that property of the user object.
    if (data) {
      return request.user[data];
    }

    // Otherwise, return the entire user object.
    return request.user;
  },
);
