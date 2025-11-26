import { CloudTasksClient } from "@google-cloud/tasks";

type EnqueueHttpTaskParams = {
  projectId: string;
  location: string;
  queue: string;
  url: string;
  json: unknown;
  serviceAccountEmail?: string;
};

export async function enqueueHttpTask(params: EnqueueHttpTaskParams): Promise<void> {
  const { projectId, location, queue, url, json, serviceAccountEmail } = params;
  const client = new CloudTasksClient();
  const parent = client.queuePath(projectId, location, queue);
  const body = Buffer.from(JSON.stringify(json)).toString("base64");
  const httpRequest: {
    httpMethod: "POST";
    url: string;
    headers: Record<string, string>;
    body: string;
    oidcToken?: { serviceAccountEmail: string };
  } = {
    httpMethod: "POST",
    url,
    headers: { "Content-Type": "application/json" },
    body,
  };
  if (serviceAccountEmail) {
    httpRequest.oidcToken = { serviceAccountEmail };
  }
  await client.createTask({ parent, task: { httpRequest } });
}
