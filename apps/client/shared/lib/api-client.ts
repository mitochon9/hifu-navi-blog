const getApiServiceUrl = (): string => {
  return process.env.API_SERVICE_URL || "http://localhost:8787";
};

type HelloResponse = {
  message: string;
  timestamp: string;
};

function isHelloResponse(data: unknown): data is HelloResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "timestamp" in data &&
    typeof (data as { message: unknown }).message === "string" &&
    typeof (data as { timestamp: unknown }).timestamp === "string"
  );
}

export async function fetchHello(): Promise<HelloResponse> {
  const baseUrl = getApiServiceUrl();
  const response = await fetch(`${baseUrl}/api/hello`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data: unknown = await response.json();
  if (!isHelloResponse(data)) {
    throw new Error("Invalid response format");
  }

  return data;
}
