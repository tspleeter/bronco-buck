import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamo-client";
import { Order } from "@/types/order";

const TABLE_NAME = process.env.DYNAMO_ORDERS_TABLE ?? "BroncoBuckOrders";

export async function createOrder(order: Order): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: order,
    })
  );
}

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

export async function getOrders(): Promise<Order[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  const items = (result.Items ?? []) as Order[];
  return items.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

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

export async function deleteOrder(orderId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
    })
  );
}
