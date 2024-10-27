export function stringToReadableStream(inputString: string) {
  // Convert the string into a Uint8Array
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(inputString);

  // Create a new ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      // Enqueue the Uint8Array into the stream
      controller.enqueue(uint8Array);
      // Close the stream
      controller.close();
    },
  });

  return readableStream;
}
