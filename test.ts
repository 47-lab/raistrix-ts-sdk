import { RaistrixClient } from "./src/utils/client";

const client = new RaistrixClient({
  apiKey: "test-api-key",
  projectId: "test-project-id",
});

client.registerEntrypoint({
  name: "test-entrypoint",
  description: "A test entrypoint",
  method: "GET",
  path: "/api/test",
  schema: {
    request: {},
    response: {},
  },
});