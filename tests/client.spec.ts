import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RaistrixClient } from "../src/utils/client";
import type { Entrypoint } from "../src/types";

const createValidEntrypoint = (
  overrides?: Partial<Entrypoint>
): Entrypoint => ({
  name: "Test Entrypoint",
  description: "A test entrypoint",
  method: "GET",
  path: "/api/test",
  schema: {
    request: {},
    response: { success: true },
  },
  ...overrides,
});

const validConfig = {
  apiKey: "test-api-key",
  projectId: "test-project-id",
  baseUrl: "https://api.raistrix.com",
};

describe("RaistrixClient", () => {
  describe("constructor", () => {
    it("should throw error when apiKey is missing", () => {
      expect(
        () =>
          new RaistrixClient({
            apiKey: "",
            projectId: "test-project-id",            
          })
      ).toThrow("API key is required");
    });

    it("should throw error when projectId is missing", () => {
      expect(
        () =>
          new RaistrixClient({
            apiKey: "test-api-key",
            projectId: "",
          })
      ).toThrow("project ID is required");
    });

    it("should create client successfully with valid config", () => {
      const client = new RaistrixClient(validConfig);
      expect(client).toBeInstanceOf(RaistrixClient);
    });
  });

  describe("registerEntrypoint - validation", () => {
    let client: RaistrixClient;

    beforeEach(() => {
      client = new RaistrixClient(validConfig);
    });

    it("should throw error when entrypoint name is missing", async () => {
      const entrypoint = createValidEntrypoint({ name: "" });
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Entrypoint name is required"
      );
    });

    it("should throw error when entrypoint description is missing", async () => {
      const entrypoint = createValidEntrypoint({ description: "" });
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Entrypoint description is required"
      );
    });

    it("should throw error when entrypoint method is missing", async () => {
      const entrypoint = createValidEntrypoint({
        method: "" as Entrypoint["method"],
      });
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Entrypoint method is required"
      );
    });

    it("should throw error when entrypoint path is missing", async () => {
      const entrypoint = createValidEntrypoint({ path: "" });
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Entrypoint path is required"
      );
    });

    it("should throw error when entrypoint schema is missing", async () => {
      const entrypoint = createValidEntrypoint({
        schema: undefined as unknown as Entrypoint["schema"],
      });
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Entrypoint schema is required"
      );
    });
  });

  describe("registerEntrypoint - API calls", () => {
    let client: RaistrixClient;
    const mockFetch = vi.fn();

    beforeEach(() => {
      client = new RaistrixClient(validConfig);
      globalThis.fetch = mockFetch;
      vi.spyOn(console, "info").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should successfully register an entrypoint", async () => {
      const mockResponse = {
        success: true,
        createdAt: "2025-12-18T10:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const entrypoint = createValidEntrypoint();
      const result = await client.registerEntrypoint(entrypoint);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "raistrix.com/api/v1/entrypoints/",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should throw auth error on 401 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({}),
      });

      const entrypoint = createValidEntrypoint();
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Authentication failed"
      );
    });

    it("should throw auth error on 403 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({}),
      });

      const entrypoint = createValidEntrypoint();
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Authentication failed"
      );
    });

    it("should throw error on other HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Server error" }),
      });

      const entrypoint = createValidEntrypoint();
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Failed to register endpoint: 500"
      );
    });

    it("should throw error on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const entrypoint = createValidEntrypoint();
      await expect(client.registerEntrypoint(entrypoint)).rejects.toThrow(
        "Endpoint registration failed: Network error"
      );
    });
  });
});
