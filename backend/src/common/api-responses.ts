import { z, ZodObject, ZodType } from 'zod';

const errorSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorSchema>;

const response = (args: {description: string, schema: ZodObject}) => {
    return {
        description: args.description,
        schema: args.schema
    }
};

const handledErrorResponses: [number, string][] = [
    [500, 'Internal server error']
]

// reusable response objects
export const commonResponses = Object.fromEntries(handledErrorResponses.map(([status, description]) => ([status, response({description, schema: errorSchema})])))

export const unauthorizedResponse = {
    401: response({description: 'Unauthorized', schema: errorSchema})
};

export const notFoundResponse = {
    404: response({description: 'Not found', schema: errorSchema})
};

export const createResponseType = ({description = 'no description', schema}: {description?: string; schema: ZodType<any>}) => {
    return {
        description,
        content: {
            'application/json': {
                schema
            }
        }
    }
};