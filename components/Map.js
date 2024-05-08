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
  const [markers, setMarkers] = useState([]); // Markers dizisi tanımlandı
  const mapRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [producerInfo, setProducerInfo] = useState(null);
  const [stopFetchingOrders, setStopFetchingOrders] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null); // Seçili marker'ı saklamak için state
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState([])
  const [offer,setOffer] = useState();
  const [waypoints, setWaypoints] = useState([]);
  const userId = useUserIdDecoder();

  const [isModalVisible, setModalVisible] = useState(true);



  const [otherMarkersInfo, setOtherMarkersInfo] = useState([]);
  const [isOfferTextInputVisible, setIsOfferTextInputVisible] = useState(false);


  const toggleModal = () => {
    setModalVisible(false);
};


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
          // Yakın markerlar bulunduğunda ilgili sipariş bilgilerini al
    const markerInfos = [];
    for (const marker of nearbyMarkers) {
      try {
        const orderId = orders[marker.id]._id;
        const response = await axios.get(`http://localhost:8000/orders/${orderId}`);
        const orderInfo = response.data;
        markerInfos.push({ marker, orderInfo });
      } catch (error) {
        // console.error('Error fetching order info:', error);
      }
    }
    setSelectedMarkerInfo(markerInfos);
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
    console.log(otherMarkersInfo[0].marker.id);
    };


    const handleOffer = async (markerId) => {
      try {
        if (selectedMarker !== null) {
          const orderId = orders[markerId]._id; // Seçili markere göre siparişin ID'sini al
          const transporterId = userId; // Taşıyıcı ID'si, değiştirilmeli
          const response = await axios.post(`http://localhost:8000/transportDetails/offer`, {
            orderId,
            transporterId,
            offer
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
        
        {selectedMarkerInfo.map((markerInfo, index) => (
          <Modal visible={isModalVisible} animationType="slide" transparent >
          <View style={styles.modalContainer} key={index}>
            <View style={{flexDirection:'row',flex:1}}>
          <Text style={{fontSize:22, fontWeight:800,marginTop:7, marginBottom:5, flex:0.9}}>Yakın Siparişler:</Text>
           <TouchableOpacity style={{margin :5, padding:5, alignSelf:'flex-end', flex:0.1}} onPress={toggleModal()}>
            <MaterialCommunityIcons name="close" size={30} color={'green'} />
           </TouchableOpacity>
           </View>
            {orders[markerInfo.marker.id]?.products.map((product, productIndex) => (
              <View key={productIndex}>
                <Text style={styles.productDetailsText}>{`${markerInfo.orderInfo.from} -> ${markerInfo.orderInfo.to}`}</Text>
                <Text style={styles.productDetailsText}>{`Ürün Adı: ${product.productId.name}`}</Text>
                <Text style={styles.productDetailsText}>{`Ağırlık: ${product.quantity} ${product.productId.qtyFormat}`}</Text>            
                <TouchableOpacity style={{backgroundColor:'#76be74', borderRadius:2, marginTop:10}} onPress={() => addMarkerRoute(markerInfo.marker.coordinate)}>
              <Text style ={{textAlign:'center', fontSize:17, fontWeight:700, color:'#fff',margin:5}}>Rotaya ekle</Text>
            </TouchableOpacity>
            <TextInput
                    style={styles.offerInput}
                    value={offer}
                    onChangeText={(offer) => setOffer(offer)}
                    placeholder="Teklif Ver"
                    keyboardType="numeric"/>
                    <TouchableOpacity style={styles.button}  onPress={() => handleOffer(markerInfo.marker.id)}>
                      <Text style={styles.buttonText}>Teklif Yap</Text>
                    </TouchableOpacity>
            </View> 
        ))}
        </View>
        </Modal>
))}
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
          </View>
        ) : null}
      </View>

      {/* Modal bileşeni */}
      
      <Modal visible={selectedMarker !== null} animationType="slide" transparent >
      <ScrollView style={styles.modalContainer} >
       
  
    {selectedMarker && (
      <>
        <Text style={{fontSize:24, fontWeight:800}}>Siparişler</Text>
        {otherMarkersInfo.map((otherMarker, otherMarkerIndex) => (
          <View key={otherMarkerIndex}>
            <View style={{borderWidth:1,borderColor:'lightgray', backgroundColor:'white',borderRadius:10, marginTop:10}}>
                
                <Text style={{ fontWeight:700, fontSize:20, padding:7}}>Sipariş {otherMarkerIndex + 1}</Text>
                {console.log(otherMarker)}
                {orders[otherMarker.marker.id]?.products.map((product, productIndex) => (
                  <View key={productIndex}>
                    <Text style={styles.productDetailsText}>{`${otherMarker.orderInfo.from} -> ${otherMarker.orderInfo.to}`}</Text>
                    <Text style={styles.productDetailsText}>{`Ürün Adı: ${product.productId.name}`}</Text>
                    <Text style={styles.productDetailsText}>{`Ağırlık: ${product.quantity} ${product.productId.qtyFormat}`}</Text>
                    <TouchableOpacity style={styles.buttonUrun} onPress={() => handleProductPress(product.productId._id)} >
                      <Text style={styles.buttonText}>Ürün Sayfası</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                    style={styles.offerInput}
                    value={offer}
                    onChangeText={(offer) => setOffer(offer)}
                    placeholder="Teklif Ver"
                    keyboardType="numeric"/>
                    <TouchableOpacity style={styles.button}  onPress={() => handleOffer(otherMarker.marker.id)}>
                      <Text style={styles.buttonText}>Teklif Yap</Text>
                    </TouchableOpacity>
                    </View>
              </View>
            ))}
            
          <TouchableOpacity  style={{margin:20, marginTop:30, padding:10, alignItems:'center',backgroundColor:'red',borderRadius:10}} onPress={() => setSelectedMarker(null)} >
            <Text style={{fontSize:20, color:'#fff',alignContent:'center'}}>KAPAT</Text>
          </TouchableOpacity>
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
    paddingVertical: 10,
    marginTop: 16,
    marginBottom:15,
    borderRadius: 10,
    marginHorizontal:62,
  },

  buttonUrun: {
    backgroundColor: "#729c44",
    paddingVertical: 5,
    marginTop: 16,
    marginBottom:10,
    borderRadius: 10,
    marginHorizontal:82,
  },

  buttonText: {
    fontSize:18, 
    fontWeight:700, 
    textAlign:'center', 
    color:'#fff'
  },
 
  modalContainer: {
    height:'auto',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ecf2e6",
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
  productDetailsText:{
    fontSize:17,
    paddingLeft:5
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
  closeButton: {
     
  }
});

export default Map;