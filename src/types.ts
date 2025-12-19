export type ClientConfig = {
  apiKey: string;
  projectId: string;
};

export type Entrypoint = {
  name: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  schema: {
    request: Record<string, any>;
    response: Record<string, any>;
  };
};

export type EntrypointResponse = {
  success: boolean;
  createdAt: string;
};
