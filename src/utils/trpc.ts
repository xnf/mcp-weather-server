import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { type weatherRouter } from "@/mcp/protocol/weather";

export const trpc = createTRPCReact<typeof weatherRouter>();

export type RouterInputs = inferRouterInputs<typeof weatherRouter>;
export type RouterOutputs = inferRouterOutputs<typeof weatherRouter>;
