import React from "react";
import { Marker } from "react-native-maps";
import PropTypes from "prop-types";

const StopMarker = React.memo(({ stopData, onPress }) => {
  const { location } = stopData;

  const [latitude, longitude] = location.split(",").map(Number);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      tracksViewChanges={false}
      image={require("../assets/images/bus/stop.png")}
      onPress={onPress}
    />
  );
});

StopMarker.propTypes = {
  stopData: PropTypes.shape({
    location: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

export default StopMarker;
