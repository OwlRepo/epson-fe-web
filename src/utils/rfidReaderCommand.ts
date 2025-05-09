import { Buffer } from "buffer";

const uiCrc16Cal = (buffer: any) => {
  const POLYNOMIAL = 0x8408;
  let crc = 0xffff;

  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ POLYNOMIAL;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return Buffer.from([crc & 0xff, (crc >> 8) & 0xff]);
};

const buildInventoryCommand = () => {
  const body = Buffer.from([0x04, 0x00, 0x01]);
  const crc = uiCrc16Cal(body);
  return Buffer.concat([body, crc]);
};

export const buildReadCommand = (epcHex: any, memory = 0x01, addr = 0x00) => {
  const epc = Buffer.from(epcHex, "hex");
  const epcWords = epc.length / 2; // 2 bytes per word

  const mem = 0x01; // User memory
  const wordPtr = 0x00;
  const numWords = 0x04;
  const pwd = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  const maskAdr = 0x00;
  const maskLen = 0x00;

  const data = Buffer.concat([
    Buffer.from([epcWords]),
    epc,
    Buffer.from([memory, wordPtr, numWords]),
    pwd,
    Buffer.from([maskAdr, maskLen]),
  ]);

  const len = data.length + 4;
  const cmd = 0x02;

  const base = Buffer.concat([Buffer.from([len, addr, cmd]), data]);

  const crc = uiCrc16Cal(base);
  return Buffer.concat([base, crc]);
};

let reader: any;

export const readEPC = async (port: any) => {
  try {
    const readEPC = buildInventoryCommand();

    const writer = port.writable.getWriter();
    await writer.write(readEPC);
    writer.releaseLock();

    if (!port.readable) {
      console.error("Port is not readable.");
      return;
    }

    if (reader) {
      try {
        await reader.cancel();
      } catch (cancelErr) {
        console.warn("Error cancelling previous reader:", cancelErr);
      }
      try {
        reader.releaseLock();
      } catch (releaseErr) {
        console.warn("Error releasing previous reader:", releaseErr);
      }
      reader = null;
    }

    await new Promise((res) => setTimeout(res, 100)); // 100ms delay

    reader = port.readable.getReader();

    const timeout = 1000; // 1 second timeout
    const startTime = Date.now();

    // let buffer: number[] = [];

    while (Date.now() - startTime < timeout) {
      const { value, done } = await reader.read();
      if (done || !value) break;

      const data = Array.from(value);
      console.log(
        "Raw response:",
        data
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase()
      );
      console.log(data[4]);

      if (data.length > 5 && data[2] === 0x01 && data[3] === 0x01) {
        console.log("Valid tag detected!");

        let pos = 5;
        const numTags = data[4] as number;

        for (let i = 0; i < numTags; i++) {
          const epcLen = data[pos] as number;
          const epcBytes = data.slice(pos + 1, pos + 1 + epcLen);
          console.log(
            `Tag ${i + 1} EPC:`,
            epcBytes
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase()
          );
          pos += 1 + epcLen;
          return epcBytes
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
        }

        // Optionally break if only one read is needed
        // break;
      } else {
        console.log("No tag detected.");
      }
    }
  } catch (err) {
    console.error("Listening error:", err);
  } finally {
    try {
      reader.releaseLock();
    } catch {}
  }
};

export const readRFIDData = async (port: any) => {
  let epc;

  //get default EPC
  try {
    epc = await readEPC(port);
    console.log("EPC:", epc);
  } catch (e) {
    console.error("Error in readRFIDData:", e);
  }
  await new Promise((res) => setTimeout(res, 100)); // delay for 100ms

  //get RFID data
  try {
    const readCmd = buildReadCommand("E2000016590301990980B698");

    const writer = port.writable.getWriter();
    await writer.write(readCmd);
    writer.releaseLock();

    if (!port.readable) {
      console.error("Port is not readable.");
      return;
    }

    if (reader) {
      try {
        await reader.cancel();
      } catch (cancelErr) {
        console.warn("Error cancelling previous reader:", cancelErr);
      }
      try {
        reader.releaseLock();
      } catch (releaseErr) {
        console.warn("Error releasing previous reader:", releaseErr);
      }
      reader = null;
    }

    await new Promise((res) => setTimeout(res, 100)); // 100ms delay

    reader = port.readable.getReader();

    const timeout = 1000; // 1 second timeout
    const startTime = Date.now();

    let buffer: number[] = [];

    while (Date.now() - startTime < timeout) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) buffer.push(...value);

      if (buffer.length >= 10) {
        const reCmd = buffer[2];
        const status = buffer[3];

        console.log("Raw:", buffer.map((b) => b.toString(16)).join(""));

        if (reCmd !== 0x02 || status !== 0x00) {
          console.error("Error or not a read response");
          return;
        }

        const dataBytes = buffer.slice(4, -2);
        const hexString = dataBytes
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase();

        console.log("Read Data:", hexString);
        return hexString;
      }
    }

    console.error("Timeout: No valid response received.");
  } catch (e) {
    console.error("Port or read error", e);
  } finally {
    if (reader) {
      try {
        reader.releaseLock();
      } catch (e) {
        console.warn("Error releasing reader in finally block:", e);
      }
      reader = null;
    }
  }
};
