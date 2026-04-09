import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Order } from "@/types/order";

// Server-side order persistence using DynamoDB.
// Replaces the localStorage approach in the original lib/orders.ts —
// localStorage orders are invisible to the store owner and lost on
// browser clear, making order fulfillment impossible.
//
// Table: BroncoBuckOrders
// Partition key: orderId (String)

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMO_ORDERS_TABLE ?? "BroncoBuckOrders";

/**
 * Create a new order
 */
export async function createOrder(order: Order): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: order,
    })
  );
}

/**
 * Get a single order by ID
 */
export async function getOrderById(
  orderId: string
): Promise<Order | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
    })
  );

  return result.Item as Order | undefined;
}

/**
 * Get all orders, sorted newest first.
 * Uses Scan — fine for low volume. Add a GSI on createdAt
 * and switch to Query if you expect high order volume.
 */
export async function getOrders(): Promise<Order[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  const items = (result.Items ?? []) as Order[];

  return items.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

/**
 * Update an existing order (e.g. status change)
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}

/**
 * Delete an order by ID
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
    })
  );
}
