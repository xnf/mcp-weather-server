import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { weatherRouter } from "@/mcp/protocol/weather";
import { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: weatherRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
