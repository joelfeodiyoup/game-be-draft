import { setCookie, getCookie } from "hono/cookie";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../domains.types";
import { createResponseType, unauthorizedResponse } from "common/api-responses";
import { z } from "zod";
import { sessionSchema } from "./auth.schema";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { authOrchestrators } from "./auth.orchestrator";

export const authRouter = new OpenAPIHono<AppEnv>();

const createAuthRoute = createTaggedRoute(RouteTag.Auth);

authRouter.openapi(
    createAuthRoute({
    method: "post",
    path: "/register",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              username: z.string(),
              password: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      201: createResponseType({
        schema: z.object({
          id: z.string(),
        }),
      }),
    },
  }),
  async (c) => {
    const body = await c.req.json();
    const result = await authOrchestrators.register(body);

    return c.json(result, 201);
  }
);

authRouter.openapi(
    createAuthRoute({
    method: "post",
    path: "/login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              username: z.string(),
              password: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      201: createResponseType({ schema: sessionSchema }),
      ...unauthorizedResponse,
    },
  }),
  async (c) => {
    const body = await c.req.json();
    const authSession = await authOrchestrators.login(body);
    if (!authSession) return c.json({ error: "Invalid credentials" }, 401);

    setCookie(c, "sessionId", authSession.id, { httpOnly: true });
    setCookie(c, "isLoggedIn", "true", { httpOnly: false });

    return c.json({ success: true }, 201);
  }
);

authRouter.openapi(
    createAuthRoute({
    method: "post",
    path: "/logout",
    request: {
      body: {
        content: {
          'application/json': undefined
        }
      }
    },
    responses: {
      200: createResponseType({
        description: 'session',
        schema: sessionSchema,
      }),
    },
  }),
  async (c) => {
    const sessionId = await getCookie(c, "sessionId");
    setCookie(c, "sessionId", "", { httpOnly: true, maxAge: 0 });
    setCookie(c, "isLoggedIn", "", { httpOnly: false, maxAge: 0 });
    if (!sessionId) {
      return c.json({ message: "success" }, 200);
    }
    const session = await authOrchestrators.logout({ sessionId });
    return c.json(session);
  }
);
authRouter.post("/logout", async (c) => {});
