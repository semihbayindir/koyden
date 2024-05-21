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
  TextInput,
  ScrollView,
} from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";
// import Constants from "expo-constants";
import MapViewDirections from "react-native-maps-directions";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useUserIdDecoder } from "./UserIdDecoder";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const { width, height } = Dimensions.get("window");

const GOOGLE_API_KEY = "AIzaSyD1-czL9crUVUOlVOa4z5-iDKAKgdUMegs";

const MAX_DISTANCE = 100*1000; // METRE HESABI
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 15;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 39.1667,
  longitude: 35.6667,
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
  const navigation = useNavigation();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [originalDistance, setOriginalDistance] = useState(0); // Original distance
  const [originalDuration, setOriginalDuration] = useState(0); // Original duration
  const [markers, setMarkers] = useState([]); // Markers dizisi tanımlandı
  const mapRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [producerInfo, setProducerInfo] = useState(null);
  const [stopFetchingOrders, setStopFetchingOrders] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null); // Seçili marker'ı saklamak için state
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState([])
  const [waypoints, setWaypoints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = useUserIdDecoder();

  const [otherMarkersInfo, setOtherMarkersInfo] = useState([]);

  useEffect(() => {
    if(userId){
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
    }, 600000); // Her 10 dakikada bir siparişleri çek
  
    // Komponent sona erdiğinde zamanlayıcıyı temizle
    return () => clearInterval(fetchInterval);
    }
  }, [stopFetchingOrders,userId]);
  
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
                    allCoordinates.push(coordinates);
                  }
                }
              }
            }
          }
          // Tüm koordinatları aldıktan sonra marker'ları güncelle
          setMarkers(allCoordinates.map((coordinate, index) => ({ id: index, coordinate })));
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
  
    const traceRouteOnReady = async (result) => {
      if (result) {
        if (originalDistance === 0 && originalDuration === 0) {
          setOriginalDistance(result.distance);
          setOriginalDuration(result.duration);
        }
    
        const totalDistance = result.distance;
        const totalDuration = result.duration;
    
        // Check if there are waypoints before setting extra distance and duration
        if (waypoints.length > 0) {
          setDistance(totalDistance);
          setDuration(totalDuration);
        } else {
          setDistance(originalDistance);
          setDuration(originalDuration);
        }
    
        const routePoints = result.coordinates;
        const nearbyMarkers = [];
    
        for (const marker of markers) {
          let minDistance = MAX_DISTANCE;
          for (const routePoint of routePoints) {
            const distance = calculateDistance(routePoint, marker.coordinate);
            if (distance < minDistance) {
              minDistance = distance;
            }
          }
          if (minDistance < MAX_DISTANCE) {
            nearbyMarkers.push(marker); 
          }
        }
    
        const markerInfos = [];
        for (const marker of nearbyMarkers) {
          try {
            const orderId = orders[marker.id]._id;
            const response = await axios.get(`http://localhost:8000/orders/${orderId}`);
            const orderInfo = response.data;
            markerInfos.push({ marker, orderInfo });
          } catch (error) {
            console.error('Error fetching order info:', error);
          }
        }
        setSelectedMarkerInfo(markerInfos);
      }
    };
    
    
    
  
  
  const traceRoute = () => {
      if (origin && destination) {
        setShowDirections(true);
        setIsModalOpen(true);
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

    const handleMarkerPress = async (marker) => {
      setSelectedMarker(marker); // Seçili marker'ı state'e ata

      // Aynı konumda bulunan diğer markaları bul
    const nearbyMarkers = markers.filter((m) => {
      return m.coordinate.latitude === marker.coordinate.latitude && m.coordinate.longitude === marker.coordinate.longitude;
    });

    // Bulunan diğer markaların bilgilerini getir ve state'e ata
    const markerInfos = [];
    for (const m of nearbyMarkers) {
      try {
        const orderId = orders[m.id]._id;
        const response = await axios.get(`http://localhost:8000/orders/${orderId}`);
        const orderInfo = response.data;
        markerInfos.push({ marker: m, orderInfo });
      } catch (error) {
        // console.error('Error fetching order info:', error);
      }
    }
    setOtherMarkersInfo(markerInfos);
    // console.log(otherMarkersInfo[0].marker.id);
    };


    const handleOffer = async (markerId) => {
      try {
        if (selectedMarker !== null) {
          const orderId = orders[markerId]._id; // Seçili markere göre siparişin ID'sini al
          const transporterId = userId; // Taşıyıcı ID'si, değiştirilmeli
          const response = await axios.post(`http://localhost:8000/transportDetails/offer`, {
            orderId,
            transporterId,
          });
          console.log('Offer created successfully:', response.data);
           // Teklif oluşturulduğunda, transportDetailsId'yi siparişe ekle
          const transportDetailsId = response.data._id;
          const addTransportDetailsIdResponse = await axios.post(`http://localhost:8000/orders/addTransportDetailsId`, {
            orderId,
            transportDetailsId
          });
          console.log('TransportDetailsId added to order:', addTransportDetailsIdResponse.data);
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    };
    
    

    const addMarkerRoute = async (coordinate) => {
      const newWaypoints = [...waypoints, coordinate]; // Mevcut waypoints dizisine yeni koordinatı ekleyin
      setWaypoints(newWaypoints); // Yeniden oluşturulan waypoints dizisini ayarlayın
    };

    const removeMarkerRoute = async (coordinateToRemove) => {
      const newWaypoints = waypoints.filter(coordinate => coordinate !== coordinateToRemove);
      setWaypoints(newWaypoints); 
    };
    

    const handleProductPress = (productId) => {
      navigation.navigate('SingleProduct', { userType :'tasiyici', productId: productId  });
    };
    
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
          !orders[marker.id].transportDetailsId ? (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={`Marker ${marker.id}`}
            onPress={() => handleMarkerPress(marker)} // Marker'a tıklandığında handleMarkerPress fonksiyonunu çağır
          />
          ) : null  
        ))}

        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            waypoints={waypoints}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Başlangıç:"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutocomplete
          label="Varış:"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <TouchableOpacity style={styles.buttonRota} onPress={traceRoute}>
          <Text style={{fontSize:18, fontWeight:700, textAlign:'center', color:'#fff'}}>Rota Oluştur</Text>
        </TouchableOpacity>
        
        <Modal transparent={true} visible={isModalOpen}>
  <ScrollView style={styles.modalContainer1}>
    <View style={{flexDirection:'row',flex:1}}>
      <Text style={{fontSize:24, fontStyle:'italic', fontWeight:800, marginBottom:10, flex:0.9}}>Yakın Siparişler:</Text>
      <TouchableOpacity style={{alignSelf:'flex-end', flex:0.1, marginBottom:10}} onPress={() => setIsModalOpen(false)}>
        <MaterialCommunityIcons name="close" size={33} color={'green'} />
      </TouchableOpacity>
    </View>
    {selectedMarkerInfo.map((markerInfo, index) => (
      <View key={index}>
        {!orders[markerInfo.marker.id]?.transportDetailsId && orders[markerInfo.marker.id]?.products.map((product, productIndex) => (
          <View style={styles.yakinSiparis} key={productIndex}>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:0.9}}>
                <Text style={[styles.productDetailsText,{fontWeight:'800',marginVertical:5}]}>{`${markerInfo.orderInfo.from} -> ${markerInfo.orderInfo.to}`}</Text>
                <Text style={styles.productDetailsText}>{`Ürün Adı: ${product.productId.name}`}</Text>
                <Text style={styles.productDetailsText}>{`Ağırlık: ${product.quantity} ${product.productId.qtyFormat}`}</Text>
                <Text style={styles.productDetailsText}>{"Taşıma Ücreti : " + orders[markerInfo.marker.id].transportFee}</Text>
              </View>
              <TouchableOpacity style={{backgroundColor:'#de510b', flex:0.2, marginRight:'1%',borderRadius:40, padding:10}} onPress={() => addMarkerRoute(markerInfo.marker.coordinate)}>
                <Text style={{textAlign:'center', fontSize:17, fontWeight:700, color:'#fff',marginTop:10}}>Rotaya ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor:'#de510b', flex:0.2, marginRight:'1%',borderRadius:40, padding:10}} onPress={() => removeMarkerRoute(markerInfo.marker.coordinate)}>
                <Text style={{textAlign:'center', fontSize:17, fontWeight:700, color:'#fff',marginTop:10}}>Rotadan Çıkar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    ))}
  </ScrollView>
</Modal>
        {distance && duration ? (
          <View>
            <Text>Mesafe: {distance.toFixed(2)} km</Text>
            <Text>Süre: {Math.ceil(duration)} dakika</Text>
            {originalDistance !== 0 && originalDuration !== 0 && (
            <>
              <Text>Ek Mesafe: {(Math.abs(distance - originalDistance)).toFixed(2)} km</Text>
              <Text>Ek Süre: {Math.abs(Math.ceil(duration - originalDuration))} dk</Text>
            </>
          )}
          </View>
        ) : null}
      </View>

      {/* Modal bileşeni */}
      
      <Modal visible={selectedMarker !== null} animationType="slide" transparent >
      <ScrollView style={styles.modalContainer} >
       
  
    {selectedMarker && (
      <>
      <View style={{flexDirection:'row',flex:1}}>
        <Text style={{fontSize:24, fontStyle:'italic', fontWeight:800, marginBottom:10, flex:0.9}}>Siparişler</Text>
          <TouchableOpacity style={{alignSelf:'flex-end', flex:0.1,marginLeft:'5%', marginBottom:10}} onPress={() => setSelectedMarker(null)}>
            <MaterialCommunityIcons name="close" size={33} color={'green'} />
          </TouchableOpacity>
      </View>
        {otherMarkersInfo.map((otherMarker, otherMarkerIndex) => (
          <View key={otherMarkerIndex}>

             {!orders[otherMarker.marker.id]?.transportDetailsId && orders[otherMarker.marker.id]?.products.map((product, productIndex) => (
            <View style={styles.yakinSiparis} key={productIndex}>
               
                  <View style={{flexDirection:'row', marginLeft:'1%'}} key={productIndex}>
                    <View >
                    <Text style={{fontSize:22, fontWeight:900, paddingLeft:7}}>{`${otherMarker.orderInfo.from} -> ${otherMarker.orderInfo.to}`}</Text>
                      <Text style={styles.productDetailsText}>{"Taşıma Ücreti : " + orders[otherMarker.marker.id].transportFee}</Text>

                    <Text style={styles.productDetailsText}>{`Ürün Adı: ${product.productId.name}`}</Text>
                    <Text style={styles.productDetailsText}>{`Ağırlık: ${product.quantity} ${product.productId.qtyFormat}`}</Text>

                    </View>

                    <TouchableOpacity style={{backgroundColor:'#de510b', marginTop:5,borderRadius:50, padding:10, marginRight:'5%', flex:0.3}} onPress={() => handleProductPress(product.productId._id)} >
                      <Text style={{textAlign:'center', fontSize:17, fontWeight:700, color:'#fff'}}>Ürün Sayfası</Text>

                    </TouchableOpacity>
                  </View>
               
                    
                    </View> 
                  ))}
              </View>
            ))}
            
          
      </>
    )}

       
        </ScrollView>
      </Modal>  
     
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
  buttonRota: {
    backgroundColor: "#729c44",
    paddingVertical: 10,
    marginTop: 16,
    marginBottom:10,
    borderRadius: 4,
  },
  button: {
    backgroundColor: "#729c44",
    paddingVertical: 7,
    marginTop: 10,
    marginBottom:10,
    borderRadius: 20,
    marginHorizontal:110,
  },

  buttonUrun: {
    backgroundColor: "#729c44",
    paddingVertical: 10,
    paddingHorizontal:10,
    marginTop: 16,
    marginBottom:10,
    borderRadius: 10,
    marginHorizontal:32,
  },

  buttonText: {
    fontSize:20, 
    fontWeight:'bold', 
    textAlign:'center', 
    color:'#fff'
  },
  modalContainer1: {
    height:'45%',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ecf2e6",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },},
  modalContainer: {
    height:'auto',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ecf2e6",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  productDetailsText:{
    fontSize:18,
    paddingLeft:7,
  },
  offerInput: {
    height: 40,
    marginHorizontal:12,
    marginTop:30,
    borderWidth: 1,
    borderRadius:7,
    padding: 10,
    backgroundColor:'#fff'
  },
  yakinSiparis:{
    
    borderColor:'lightgray',
    marginBottom:20,
    borderRadius:20,
    padding:10,
    backgroundColor:'#fff'
  }
});

export default Map;