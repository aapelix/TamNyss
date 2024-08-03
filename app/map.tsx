import { Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import VehicleMarker from "@/components/vehicleMarker";
import StopMarker from "@/components/stopMarker";
import {
  darkModeStyle,
  isInTampere,
  timeDifference,
  timeToMinutes,
  formatTime,
} from "./utils";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import * as Location from "expo-location";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { imageMapping } from "./imageMapping";

export default function Map() {
  const [vehiclePositions, setVehiclePositions] = useState([]);
  const [busStopPositions, setBusStopPositions] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [usrLoc, setUsrLoc] = useState<Location.LocationObject>();
  const [region, setRegion] = useState({
    latitude: 61.4978,
    longitude: 23.761,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [popupData, setPopupData] = useState({
    location: "61.49754,23.76152",
    municipality: {
      name: "Tampere",
      shortName: "837",
      url: "https://data.itsfactory.fi/journeys/api/1/municipalities/837",
    },
    name: "Keskustori H",
    shortName: "0001",
    tariffZone: "A",
    url: "https://data.itsfactory.fi/journeys/api/1/stop-points/0001",
  });
  const [busStopPopupVis, setBusStopPopupVis] = useState(false);
  const [comingBusses, setComingBusses] = useState([]);

  const bottomSheetRef = useRef<BottomSheet>(null);

  let interval;

  const fetchFilteredCalls = (stopPointRef: string) => {
    return new Promise((resolve) => {
      const filteredCalls = vehiclePositions.flatMap((journey) =>
        journey.monitoredVehicleJourney.onwardCalls
          .filter((call) => call.stopPointRef == stopPointRef)
          .map((call) => ({
            ...call,
            lineRef: journey.monitoredVehicleJourney.lineRef,
          })),
      );

      setComingBusses(filteredCalls);
    });
  };

  const handleOpenBottomSheet = async () => {
    bottomSheetRef.current?.snapToIndex(1);
    setBusStopPopupVis(true);
  };

  const handleCloseBottomSheet = () => {
    clearInterval(interval);
    bottomSheetRef.current?.close();
    setBusStopPopupVis(false);
  };

  async function getVehiclePositions() {
    try {
      const res = await fetch(
        "https://data.itsfactory.fi/journeys/api/1/vehicle-activity",
      );
      const poss = await res.json();

      setVehiclePositions(poss.body);
    } catch (error) {
      console.error(error);
    }
  }

  async function getBusStopPositions() {
    try {
      const res = await fetch(
        "https://data.itsfactory.fi/journeys/api/1/stop-points",
      );
      const stops = await res.json();

      setBusStopPositions(stops.body);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getBusStopPositions();
    setInterval(() => getVehiclePositions(), 3000);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Access to location denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUsrLoc(location);

      setRegion((prevCoords) => ({
        ...prevCoords,
        longitude: isInTampere(
          location.coords.latitude,
          location.coords.longitude,
        )
          ? location.coords.longitude
          : 23.761,
        latitude: isInTampere(
          location.coords.latitude,
          location.coords.longitude,
        )
          ? location.coords.latitude
          : 61.4978,
      }));
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MapView
        className="w-screen h-screen"
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        }}
        onRegionChangeComplete={setRegion}
        customMapStyle={darkModeStyle}
      >
        {usrLoc && (
          <Marker
            coordinate={{
              latitude: usrLoc.coords.latitude,
              longitude: usrLoc.coords.longitude,
            }}
            image={require("../assets/images/user.png")}
          />
        )}

        {vehiclePositions &&
          vehiclePositions.map((veh, index) => (
            <VehicleMarker vehicle={veh} key={index} />
          ))}

        {busStopPositions &&
          region.latitudeDelta <= 0.02 &&
          busStopPositions.map((stop, index) => (
            <StopMarker
              stopData={stop}
              key={stop.shortName}
              onPress={() => {
                setPopupData(stop);
                interval = setInterval(() => {
                  fetchFilteredCalls(stop.url);
                }, 60000);
                handleOpenBottomSheet();
              }}
            />
          ))}
      </MapView>

      {busStopPopupVis && (
        <BottomSheet
          // BUS STOP POPUP
          ref={bottomSheetRef}
          snapPoints={["30%", "50%", "70%"]}
          onClose={handleCloseBottomSheet}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: "#1c1c1c" }}
          handleIndicatorStyle={{ backgroundColor: "#2c2c2c" }}
        >
          <BottomSheetView className="flex items-center relative text-white">
            <View className="left-5">
              <Text className="text-[#e2e2e2] text-2xl font-black">
                {popupData.name}
              </Text>
              <Text className="text-[#adadad]">
                Vyöhyke {popupData.tariffZone}
              </Text>
            </View>
          </BottomSheetView>
          <BottomSheetScrollView>
            {comingBusses
              .sort(
                (a, b) =>
                  timeToMinutes(formatTime(a.expectedDepartureTime)) -
                  timeToMinutes(formatTime(b.expectedDepartureTime)),
              )
              .map((bus, index) => {
                const imgSrc = imageMapping[bus.lineRef];
                return (
                  <View
                    className="flex flex-row justify-between px-5 mt-3"
                    key={index}
                  >
                    <Text className="text-[#e2e2e2] text-xl">
                      {bus.lineRef}
                    </Text>
                    <Text className="text-[#adadad] text-xl">
                      {timeDifference(bus.expectedDepartureTime)}
                    </Text>
                  </View>
                );
              })}
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </View>
  );
}
