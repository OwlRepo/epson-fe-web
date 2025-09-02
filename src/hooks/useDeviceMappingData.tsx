import { useMemo } from "react";
import { useSocket } from "./useSocket";
export default function useDeviceMappingData(props: {
  floor: string;
  area?: string;
}) {
  const {
    data: device,
    emitData,
    isConnected,
    joinRoom,
  } = useSocket<any>({
    room: "view_device_controller",
    dataType: "live",
  });
  const handleDeviceUpdate = (device: any) => {
    emitData("device_update", device);
  };

  const refreshRoom = () => {
    // Leave current room and rejoin after delay to get fresh preload data
    emitData("leave", "view_device_controller");
    setTimeout(() => {
      emitData("join", "view_device_controller");
    }, 500);
  };
  const deviceList = useMemo(() => {
    return {
      "1": device?.filter(
        (device: any) =>
          device.Floor === "1" &&
          device.DeviceName !== "" &&
          device.DeviceName !== null
      ),
      "2": device?.filter(
        (device: any) =>
          device.Floor === "2" &&
          device.DeviceName !== "" &&
          device.DeviceName !== null
      ),
      "no-location": device?.filter((device: any) => !device.Floor),
    };
  }, [device, props.floor]);

  const deviceListByArea = useMemo(() => {
    return {
      "1": device?.filter(
        (device: any) =>
          device.Floor === props.floor &&
          device.DeviceName !== "" &&
          device.DeviceName !== null &&
          device.Area === props.area
      ),
      "2": device?.filter(
        (device: any) =>
          device.Floor === props.floor &&
          device.DeviceName !== "" &&
          device.DeviceName !== null &&
          device.Area === props.area
      ),
      "no-location": device?.filter((device: any) => !device.Floor),
    };
  }, [device, props.floor, props.area]);

  const deviceCounts = useMemo(
    () => ({
      perFloor: {
        total: device?.length,
        active: device?.filter(
          (device: any) =>
            device.Status === "Active" && device.Floor === props.floor
        ).length,
        inactive: device?.filter(
          (device: any) =>
            (device.Status === "Inactive" || device.Status === "In Active") &&
            device.Floor === props.floor
        ).length,
        unregistered: device?.filter(
          (device: any) => !device.DeviceName && device.Floor === props.floor
        ).length,
        noLocation: device?.filter((device: any) => !device.Floor).length,
        perArea: {
          total: device?.filter(
            (device: any) =>
              device.Floor === props.floor && device.Area === props.area
          ).length,
          active: device?.filter(
            (device: any) =>
              device.Floor === props.floor &&
              device.Status === "Active" &&
              device.Area === props.area
          ).length,
          inactive: device?.filter(
            (device: any) =>
              device.Floor === props.floor &&
              (device.Status === "Inactive" || device.Status === "In Active") &&
              device.Area === props.area
          ).length,
          unregistered: device?.filter(
            (device: any) =>
              device.Floor === props.floor &&
              !device.DeviceName &&
              device.Area === props.area
          ).length,
          noLocation: device?.filter(
            (device: any) =>
              device.Floor === props.floor &&
              !device.XAxis &&
              device.Area === props.area
          ).length,
        },
      },
      perArea: [
        {
          name: "Area I",
          id: "1",
          deviceCount: device?.filter(
            (device: any) => device.Floor === props.floor && device.Area === "1"
          ).length,
        },
        {
          name: "Area II",
          id: "2",
          deviceCount: device?.filter(
            (device: any) => device.Floor === props.floor && device.Area === "2"
          ).length,
        },
        {
          name: "Area III",
          id: "3",
          deviceCount: device?.filter(
            (device: any) => device.Floor === props.floor && device.Area === "3"
          ).length,
        },
        {
          name: "Area IV",
          id: "4",
          deviceCount: device?.filter(
            (device: any) => device.Floor === props.floor && device.Area === "4"
          ).length,
        },
      ],
    }),
    [device, props.floor, props.area]
  );

  return {
    deviceList,
    deviceListByArea,
    deviceCounts,
    emitData,
    isConnected,
    handleDeviceUpdate,
    joinRoom,
    refreshRoom,
  };
}
