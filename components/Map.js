import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  TextInput
} from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";
// import Constants from "expo-constants";
import MapViewDirections from "react-native-maps-directions";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const GOOGLE_API_KEY = "AIzaSyCnB7axdJK9e345w6f1c-Da6pzxPpA0uD8";

const MAX_DISTANCE = 1000;
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 40.949581,
  longitude: 29.109850,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

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

const Map = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markers, setMarkers] = useState([]); // Markers dizisi tanımlandı
  const mapRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [producerInfo, setProducerInfo] = useState(null);
  const [stopFetchingOrders, setStopFetchingOrders] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null); // Seçili marker'ı saklamak için state
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState([])
  const [offer,setOffer] = useState();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/orders/`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
  
    // İlk açılışta ve orders değiştiğinde siparişleri çek
    fetchOrders();
  
    // Daha sonra 1 dakika aralıklarla siparişleri çek
    const fetchInterval = setInterval(() => {
      if (!stopFetchingOrders) {
        fetchOrders();
      }
    }, 60000); // Her 1 dakikada bir siparişleri çek
  
    // Komponent sona erdiğinde zamanlayıcıyı temizle
    return () => clearInterval(fetchInterval);
  }, [stopFetchingOrders]);
  
  useEffect(() => {
    const fetchProducerInfo = async () => {
      try {
        if (orders && orders.length > 0) {
          let allCoordinates = [];
          // Tüm siparişlerde döngü yap
          for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            // Her bir siparişin ürünlerinde döngü yap
            for (let j = 0; j < order.products.length; j++) {
              const product = order.products[j];
              // Her bir ürünün üreticisine ait bilgiyi getir
              const response = await axios.get(`http://localhost:8000/api/users/${product.productId.producerId}`);
              if (response.data && response.data.verification && response.data.verification.producerAddress) {
                const { district } = response.data.verification.producerAddress;
                if (district) {
                  const address = `${district}, Turkey`;
                  const coordinates = await getCoordinatesFromAddress(address);
                  if (coordinates) {
                  
                    if (!allCoordinates.some(coord => coord.latitude === coordinates.latitude && coord.longitude === coordinates.longitude)) {
                      allCoordinates.push(coordinates);
                    }                  }
                }
              }
            }
          }
          // Tüm koordinatları aldıktan sonra marker'ları güncelle
          setMarkers(allCoordinates.map((coordinate, index) => ({ id: index, coordinate })));
          console.log(markers)
        }
      } catch (error) {
        console.error('Error fetching producer information:', error);
      }
    };
  
    fetchProducerInfo();
  }, [orders]);
  

  useEffect(() => {
    if (producerInfo && producerInfo.verification && producerInfo.verification.producerAddress) {
      const { district } = producerInfo.verification.producerAddress;
      if (district) {
        const address = `${district}, Turkey`; // İlçe bilgisini adres formatına dönüştür
        getCoordinatesFromAddress(address)
          .then(coordinates => {
            if (coordinates) {
              // Yeni bir marker oluşturarak var olan markerları koru
              setMarkers(prevMarkers => [...prevMarkers, { id: prevMarkers.length + 1, coordinate: coordinates }]);
            //   console.log(markers);
            }
          });
      }
    }
  }, [producerInfo]);

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
  const moveTo = async (position) => {
      const camera = await mapRef.current?.getCamera();
      if (camera) {
        camera.center = position;
        mapRef.current?.animateCamera(camera, { duration: 1000 });
      }
    };
  
    const edgePaddingValue = 70;
  
    const edgePadding = {
      top: edgePaddingValue,
      right: edgePaddingValue,
      bottom: edgePaddingValue,
      left: edgePaddingValue,
    };
  
    const traceRouteOnReady = (result) => {
      // console.log("Route details:", result);
      if (result) {
      const routePoints = result.coordinates;
      const nearbyMarkers = [];
      markers.forEach((marker) => {
        let minDistance = MAX_DISTANCE;
        for (let i = 0; i < routePoints.length; i++) {
          const routePoint = routePoints[i];
          const distance = calculateDistance(routePoint, marker.coordinate);
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
        if (minDistance < MAX_DISTANCE) {
          nearbyMarkers.push(marker);
        }
      });
    //   console.log("Yakın markerlar:", nearbyMarkers);
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

    const handleMarkerPress = (marker) => {
      setSelectedMarker(marker); // Seçili marker'ı state'e ata
    };

    const handleOffer = () => {
      
    }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
      >
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        
        {/* Tanımlanan markers'lar */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={`Marker ${marker.id}`}
            onPress={() => handleMarkerPress(marker)} // Marker'a tıklandığında handleMarkerPress fonksiyonunu çağır
          />
        ))}

        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      {/* <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Origin"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutocomplete
          label="Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
          </View>
        ) : null}
      </View> */}

      {/* Modal bileşeni */}
      <Modal visible={selectedMarker !== null} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    {selectedMarker && (
      <>
        <Text>Marker Information</Text>
        {/* <Text>{`Marker ID: ${selectedMarker.id}`}</Text> */}
        {/* Her bir ürün için bilgileri göster */}
        {orders[selectedMarker.id]?.products.map((product, productIndex) => (
          <View key={productIndex}>
            <Text>{`Product ${productIndex + 1}`}</Text>
            <Text>{`Product Name: ${product.productId.name}`}</Text>
            <Text>{`Product Price: ${product.price}`}</Text>
          </View>
        ))}
        <TextInput 
        style={styles.offerInput}
        value={offer}
        onChangeText={(offer) => setOffer(offer)}
        placeholder="Teklif Ver."
        keyboardType="numeric"/>
        <Button title="Teklif Yap"/>
        <Button title="Close" onPress={() => setSelectedMarker(null)} />
      </>
    )}
  </View>
</Modal>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default Map;