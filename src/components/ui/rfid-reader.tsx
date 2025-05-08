import React, { useState } from "react";

function SerialReader() {
  const [status, setStatus] = useState("Not connected");
  const [data, setData] = useState("");

  const connectToReader = async () => {
    try {
      // Check if the Web Serial API is supported
      if (!("serial" in navigator)) {
        setStatus("Web Serial API not supported in this browser.");
        return;
      }

      // Request port access (user must select the device)
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      // Set up the reader to handle incoming data
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      setStatus("Connected, reading RFID data...");

      // Read data until the port is closed
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          // Process the data (e.g., stripping non-printable characters)
          let cleanedData = value.trim(); // Clean any unwanted whitespace or non-printable characters

          // Optionally, filter out characters you don't want, e.g., newline, etc.
          cleanedData = cleanedData.replace(/\r\n|\n|\r/g, ""); // Remove newline characters

          // Update state with the new data
          setData((prev) => prev + cleanedData);
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error("Error connecting to port:", error);
      setStatus("Failed to connect to the RFID reader.");
    }
  };

  return (
    <div>
      <button onClick={connectToReader}>Connect to RFID Reader</button>
      <div>
        <p>Status: {status}</p>
        <pre>{data}</pre>
      </div>
    </div>
  );
}

export default SerialReader;
