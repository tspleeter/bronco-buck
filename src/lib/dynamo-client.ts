import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// When running on AWS (Amplify/Lambda), credentials come automatically
// from the IAM execution role — no explicit credentials needed.
// The DYNAMO_ env vars for keys are only needed for local development.

const isLocal = process.env.NODE_ENV === "development";

const client = new DynamoDBClient({
  region: process.env.DYNAMO_REGION ?? "us-east-1",
  ...(isLocal && process.env.DYNAMO_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
      secretAccessKey: process.env.DYNAMO_SECRET_KEY ?? "",
    },
  } : {}),
});

export const docClient = DynamoDBDocumentClient.from(client);
