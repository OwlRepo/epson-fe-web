import { describe, expect, it } from "vitest";
import { mapEVSSocketDeviceListOptions } from "./useGetEVSSocketDeviceList";

describe("mapEVSSocketDeviceListOptions", () => {
  it("maps valid device rows to filter options", () => {
    expect(
      mapEVSSocketDeviceListOptions([
        {
          ID: "C66_T_20241024",
          DeviceName: "kin",
          DeviceType: "Chainway",
        },
      ])
    ).toEqual([
      {
        label: "kin",
        value: "C66_T_20241024",
      },
    ]);
  });

  it("omits rows without usable IDs or device names", () => {
    expect(
      mapEVSSocketDeviceListOptions([
        { ID: "", DeviceName: "No ID" },
        { DeviceName: "Missing ID" },
        { ID: "EVS_ONLY", DeviceName: null },
        { ID: "BLANK_NAME", DeviceName: "   " },
        { ID: "VALID", DeviceName: "Valid Device" },
      ])
    ).toEqual([
      {
        label: "Valid Device",
        value: "VALID",
      },
    ]);
  });

  it("deduplicates by ID and keeps the first option", () => {
    expect(
      mapEVSSocketDeviceListOptions([
        { ID: "D1", DeviceName: "First Name" },
        { ID: "D1", DeviceName: "Second Name" },
        { ID: "D2", DeviceName: "Another Device" },
      ])
    ).toEqual([
      {
        label: "First Name",
        value: "D1",
      },
      {
        label: "Another Device",
        value: "D2",
      },
    ]);
  });
});
