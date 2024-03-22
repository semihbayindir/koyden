import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useUserIdDecoder } from "./UserIdDecoder";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const { width, height } = Dimensions.get("window");
const GOOGLE_API_KEY = "AIzaSyD1-czL9crUVUOlVOa4z5-iDKAKgdUMegs";

function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
}) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: "tr",
        }}
      />
    </>
  );
}

// Fonksiyon, iki koordinat arasındaki mesafeyi hesaplar
function calculateDistance(coord1, coord2) {
  const R = 6371e3;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

const edgePaddingValue = 70;

const edgePadding = {
  top: edgePaddingValue,
  right: edgePaddingValue,
  bottom: edgePaddingValue,
  left: edgePaddingValue,
};

const Route = () => {
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.02;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    const INITIAL_POSITION = {
    latitude: 40.949581,
    longitude: 29.109850,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
    };

    const [showDirections, setShowDirections] = useState(true);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([]); // Markers dizisi tanımlandı
    const [waypoints, setWaypoints] = useState([]);
    const [tempWaypoints, setTempWaypoints] = useState([]);
    const userId = useUserIdDecoder();
    const [transportDetails,setTransportDetails] = useState([]);
    const [orders,setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
          if (userId) {
            try {
              const transportResponse = await axios.get(`http://localhost:8000/transportDetails/${userId}`);
              setTransportDetails(transportResponse.data);
    
              const orderPromises = transportResponse.data.map(async (transportDetail) => {
                const orderResponse = await axios.get(`http://localhost:8000/orders/${transportDetail.orderId}`);
                return orderResponse.data;
              });
                const orderData = await Promise.all(orderPromises);
                setOrders(orderData);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
          }
        };
        fetchOrders();
  }, [userId]);

  useEffect(() => {
    const fetchProducerInfo = async () => {
      try {
        if (orders && orders.length > 0) {
          let allCoordinates = [];
          // Tüm siparişlerde döngü yap
          for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            // Her bir siparişin ürünlerinde döngü yap
            for (let j = 0; j < orders.length; j++) {
              const producerId = order.producerId;
              // Her bir ürünün üreticisine ait bilgiyi getir
              const response = await axios.get(`http://localhost:8000/api/users/${producerId}`);
              if (response.data && response.data.verification && response.data.verification.producerAddress) {
                const { district } = response.data.verification.producerAddress;
                if (" district "+ district) {
                  const address = `${district}, Turkey`;
                  const coordinates = await getCoordinatesFromAddress(address);
                  if (coordinates) {
                    if (!allCoordinates.some(coord => coord.latitude === coordinates.latitude && coord.longitude === coordinates.longitude)) {
                      allCoordinates.push(coordinates);
                    }
                  }
                }
              }
            }
          }
          // Tüm koordinatları aldıktan sonra marker'ları güncelle
          setMarkers(allCoordinates.map((coordinate, index) => ({ id: index, coordinate })));
          setTempWaypoints(allCoordinates); 
        }
      } catch (error) {
        console.error('Error fetching producer information:', error);
      }
    };
  
    fetchProducerInfo();
  }, [orders]);

  useEffect(() => {
    const addClosestWaypoint = async () => {
      if (origin && destination) {
        const distances = tempWaypoints.map(waypoint => ({
          waypoint,
          distance: calculateDistance(origin, waypoint)
        }));
        distances.sort((a, b) => a.distance - b.distance);
        const closestWaypoint = distances[0].waypoint;
        setWaypoints([closestWaypoint]);
  
        let currentOrigin = closestWaypoint;
        let remainingWaypoints = tempWaypoints.filter(waypoint => waypoint !== closestWaypoint);
        while (remainingWaypoints.length > 0) {
          const distancesToRemaining = remainingWaypoints.map(waypoint => ({
            waypoint,
            distance: calculateDistance(currentOrigin, waypoint)
          }));
          distancesToRemaining.sort((a, b) => a.distance - b.distance);
          const nextClosestWaypoint = distancesToRemaining[0].waypoint;
          setWaypoints(prevWaypoints => [...prevWaypoints, nextClosestWaypoint]);
          currentOrigin = nextClosestWaypoint;
          remainingWaypoints = remainingWaypoints.filter(waypoint => waypoint !== nextClosestWaypoint);
        }
      }
    };
  
    addClosestWaypoint();
  }, [origin, destination, tempWaypoints]);
  
  

  async function getCoordinatesFromAddress(address) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: GOOGLE_API_KEY,
        },
      });
      if (response.data && response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error('No coordinates found for the address');
      }
    } catch (error) {
      console.error('Error fetching coordinates from address:', error);
      return null;
    }
  }

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };
  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  };

  const onPlaceSelected = (details, flag) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    moveTo(position);
  };

    return (
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_POSITION}
          >
            {/* Tanımlanan marker'lar */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                title={`Marker ${marker.id}`}
              />
            ))}
    
            {showDirections && origin !==null && destination !==null && (
              <>
              <MapViewDirections
                origin={origin}
                destination={destination}
                apikey={GOOGLE_API_KEY}
                waypoints={waypoints}
                strokeColor="#6644ff"
                strokeWidth={4}
              />
              </>
            )}
          </MapView>

          <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Başlangıç"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutocomplete
          label="Varış"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Rota Oluştur</Text>
        </TouchableOpacity>
      </View>
    </View>
      );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    map: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    },
    searchContainer: {
      position: "absolute",
      width: "90%",
      backgroundColor: "white",
      shadowColor: "black",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
      padding: 8,
      borderRadius: 8,
      top: 20,
    },
    input: {
      borderColor: "#888",
      borderWidth: 1,
    },
    button: {
      backgroundColor: "#bbb",
      paddingVertical: 12,
      marginTop: 16,
      borderRadius: 4,
    },
    buttonText: {
      textAlign: "center",
    },
    modalContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    offerInput: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

export default Route;