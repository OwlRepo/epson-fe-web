import { fi } from "@faker-js/faker";
import { set } from "date-fns";
import React, { useEffect, useState } from "react";

// Extend the Navigator type to include the serial property
declare global {
  interface Navigator {
    serial: {
      requestPort: () => Promise<any>;
    };
  }
}
import { Buffer } from "buffer";
import { readRFIDData } from "@/utils/rfidReaderCommand";

function uiCrc16Cal(buffer) {
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
}

function buildReadCommand(epcHex, addr = 0x00) {
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
    Buffer.from([mem, wordPtr, numWords]),
    pwd,
    Buffer.from([maskAdr, maskLen]),
  ]);

  const len = data.length + 4;
  const cmd = 0x02;

  const base = Buffer.concat([Buffer.from([len, addr, cmd]), data]);

  const crc = uiCrc16Cal(base);
  return Buffer.concat([base, crc]);
}

const SerialPortComponent = () => {
  const [responseData, setResponseData] = useState(null);
  const [status, setStatus] = useState("Waiting for port access...");
  const [port, setPort] = useState<any>(null);

  const handlePortAccess = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setPort(port);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    () => port.close();
  }, []);

  const openPort = async () => {
    if (!port) return;
    const data = await readRFIDData(port, "E20000165903003823202B91");
    setResponseData(data);
    console.log(data);
  };

  return (
    <div>
      <h2>Serial Port Communication</h2>
      <p>Status: {status}</p>
      <button onClick={handlePortAccess}>Request Port Access</button>
      <button onClick={openPort}>close</button>

      <p>
        {responseData
          ? `Data Received: ${responseData}`
          : "Waiting for data..."}
      </p>
    </div>
  );
};

export default SerialPortComponent;
