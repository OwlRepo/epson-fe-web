import { useMemo } from "react";
import { useSocket } from "./useSocket";
export default function useDeviceMappingData(props: {
  floor: string;
  area?: string;
}) {
  const { data: device, emitData } = useSocket<any>({
    room: "view_device_controller",
    dataType: "live",
  });
  //   emitData("device_update", {
  //     id: "Elid_Home",
  //     name: "Elid_Home",
  //     controllertype: "Safe",
  //     description: "Active",
  //     status: "In Active",
  //     floor: "2",
  //     area: "1",
  //     xaxis: "10",
  //     yaxis: "10",
  //     archive: 0,
  //   });
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
    };
  }, [device, props.floor]);

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
          (device: any) =>
            !device.DeviceName &&
            !device.ControllerType &&
            device.Floor === props.floor
        ).length,
        noLocation: device?.filter(
          (device: any) => !device.XAxis && !device.YAxis
        ).length,
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
    [device, props.floor]
  );

  return { deviceList, deviceCounts, emitData };
}
