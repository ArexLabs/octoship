export async function computeSha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAssetChecksum(
  downloadUrl: string,
  expectedSha256: string
): Promise<boolean> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download asset: ${response.status} ${response.statusText}`
    );
  }
  const buffer = await response.arrayBuffer();
  const hash = await computeSha256(buffer);
  return hash === expectedSha256;
}
