import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamo-client";
import { Order, OrderStatus, Carrier } from "@/types/order";

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

export interface FulfillmentUpdate {
  status: OrderStatus;
  carrier?: Carrier;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
}

/**
 * Update an order's fulfillment fields (status + optional tracking) and return
 * the full updated order. Only the fields present on `update` are written.
 */
export async function updateOrderFulfillment(
  orderId: string,
  update: FulfillmentUpdate
): Promise<Order | undefined> {
  const names: Record<string, string> = { "#status": "status" };
  const values: Record<string, unknown> = {
    ":status": update.status,
    ":updatedAt": new Date().toISOString(),
  };
  const sets: string[] = ["#status = :status", "updatedAt = :updatedAt"];

  const optional: [keyof FulfillmentUpdate, string][] = [
    ["carrier", "carrier"],
    ["trackingNumber", "trackingNumber"],
    ["trackingUrl", "trackingUrl"],
    ["shippedAt", "shippedAt"],
  ];

  for (const [key, attr] of optional) {
    const val = update[key];
    if (val !== undefined) {
      names[`#${attr}`] = attr;
      values[`:${attr}`] = val;
      sets.push(`#${attr} = :${attr}`);
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
      UpdateExpression: "SET " + sets.join(", "),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Order | undefined;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { orderId },
    })
  );
}
