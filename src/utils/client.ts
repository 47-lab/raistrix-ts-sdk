import { z } from "zod";
import type { ClientConfig, EntrypointResponse, Entrypoint } from "../types";

const entrypointSchema = z.object({
  name: z.string().min(1, "Entrypoint name is required"),
  description: z.string().min(1, "Entrypoint description is required"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  path: z.string().min(1, "Entrypoint path is required"),
  schema: z.object({
    request: z.record(z.string(), z.any()),
    response: z.record(z.string(), z.any()),
  }),
});

export class RaistrixClient {
  private apiKey: string;
  private projectId: string;
  private entrypoints: Entrypoint[] = [];

  constructor(config: ClientConfig) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    if (!config.projectId) {
      throw new Error(
        "project ID is required, you will find the project ID in the raistrix.com dashboard"
      );
    }

    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
  }

  /**
   * Sync all entrypoints to the API
   * @returns Promise with sync response
   */
  private async syncEntrypoints(): Promise<EntrypointResponse> {
    const payload = {
      projectId: this.projectId,
      entrypoints: this.entrypoints,
    };

    try {
      const response = await fetch("https://raistrix.com/api/v1/entrypoints/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Authentication failed. Your API key or project ID may have been revoked."
          );
        }

        throw new Error(
          `Failed to sync entrypoints: ${response.status} ${
            response.statusText
          }. ${errorData.message || ""}`
        );
      }

      const result: EntrypointResponse = await response.json();

      console.info(
        `${this.entrypoints.length} entrypoint(s) synced to raistrix.com`
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Entrypoints sync failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Register multiple entrypoints at once
   * @param entrypoints - Array of entrypoint configurations
   * @returns Promise with registration response
   */
  async registerEntrypoints(
    entrypoints: Entrypoint[]
  ): Promise<EntrypointResponse> {
    const validated = entrypoints.map((ep) => entrypointSchema.parse(ep));
    this.entrypoints.push(...validated);
    return this.syncEntrypoints();
  }

  /**
   * Register a single entrypoint to raistrix.com
   * @param config - Entrypoint configuration
   * @returns Promise with registration response
   */
  async registerEntrypoint(config: Entrypoint): Promise<EntrypointResponse> {
    const validated = entrypointSchema.parse(config);
    this.entrypoints.push(validated);
    return this.syncEntrypoints();
  }
}
