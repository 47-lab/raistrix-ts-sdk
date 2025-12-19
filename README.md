# Raistrix Typescript SDK

This is the Repo for the node package that you can use to interact with the raistrix api.
The repo provides a client and a registerEntrypoint function. You can define a entrypoint in your code to expose it threw our infrastructure to get your informations directly into chatgpt, gemini, claude and co. See our code examples to understand how you can use our typescript sdk.

## Code examples

### Client

```typescript
import { RaistrixClient } from "./src/utils/client";

const client = new RaistrixClient({
  apiKey: "your-api-key",
  projectId: "your-project-id",
});
```

- you can find your api keys in your account settings
- you can create a project in the service center under entrypoints
- than you can copy the projectId of the project and use it for the client

### RegisterEntrypoint

```typescript
import { RaistrixClient } from "./src/utils/client";

const client = new RaistrixClient({
  apiKey: "your-api-key",
  projectId: "your-project-id",
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
```

- name: here you can define the name of the new entrypoint
- description: describe the entrypoint in a meaningful adn understandble way for ai agents
- method: allowed Methods GET, POST, PUT, DELETE, PATCH
- path: add the path where we can reach your api endpoint
- schema.request: here you define the request schema in json that ypur api endpoint requires
- schema.response: here you define the response schema in json that ypur api endpoint returns

The showed entrypoint will automatically register a new entrypoint threw the raistrix api, while your server is running.
