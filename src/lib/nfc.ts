declare class NDEFReader {
  addEventListener(
    type: "reading",
    listener: (event: { serialNumber: string }) => void
  ): void;
  addEventListener(
    type: "readingerror",
    listener: (event: Event) => void
  ): void;
  scan(options?: { signal?: AbortSignal }): Promise<void>;
}

export function isNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export async function startNfcReader(
  onRead: (serialNumber: string) => void,
  onError: (error: Error) => void
): Promise<AbortController> {
  if (!isNfcSupported()) {
    throw new Error("Web NFC not supported on this device");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ndef = new (window as any).NDEFReader() as NDEFReader;
  const controller = new AbortController();

  ndef.addEventListener("reading", (event) => {
    onRead(event.serialNumber);
  });

  ndef.addEventListener("readingerror", () => {
    onError(new Error("NFC read error"));
  });

  await ndef.scan({ signal: controller.signal });
  return controller;
}
