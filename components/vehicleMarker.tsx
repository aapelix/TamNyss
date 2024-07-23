import { imageMapping } from "@/app/imageMapping";
import { Marker } from "react-native-maps";

export default function VehicleMarker(vehicle: any) {
  const veh = vehicle.vehicle.monitoredVehicleJourney;

  // @ts-expect-error
  const imgSrc = imageMapping[veh.lineRef];

  return (
    <Marker
      coordinate={{
        latitude: parseFloat(veh.vehicleLocation.latitude),
        longitude: parseFloat(veh.vehicleLocation.longitude),
      }}
      image={imgSrc ? imgSrc : require("../assets/images/bus/null.png")}
    />
  );
}
