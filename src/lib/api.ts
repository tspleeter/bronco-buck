const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export async function createBuild(data: {
  bodyColor: string;
  maneColor: string;
  base: string;
}) {
  const res = await fetch(`${API_URL}/builds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create build: ${text}`);
  }

  return res.json();
}

export async function getBuild(id: string) {
  const res = await fetch(`${API_URL}/builds/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get build: ${text}`);
  }

  return res.json();
}