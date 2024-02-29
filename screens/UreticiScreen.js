import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProduct from '../components/AddProduct';
import ProfileScreen from '../components/Profile';
import UreticiMyProducts from '../components/UreticiMyProducts';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { decode as atob } from 'base-64';
import { Text, View, Modal, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Loading from './loadings/Loading';


const Tab = createBottomTabNavigator();
const UreticiScreen = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [verificationInput, setVerificationInput] = useState({
    producerAddress: {
      city: '',
      district: '',
      street: ''
    },
    paymentInfo: {
      iban: '',
      accountNumber: ''
    },
    description: ''
  });


  const base64UrlDecode = (input) => {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token !== null) {
          const [header, payload, signature] = token.split('.');
          const decodedPayload = base64UrlDecode(payload);
          setUserId(decodedPayload.userId);
        }
      } catch (error) {
        console.error('Token alınamadı veya decode edilemedi:', error);
      }
    };
  
    fetchUsers();
  }, []);


  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:8000/users/${userId}/verification`);
          const data = response.data;
          setVerificationData(data);
          if (!data) {
            setShowVerificationModal(true); // verificationData yoksa modalı aç
          }
        }
      } catch (error) {
        console.error('Doğrulama bilgileri alınamadı:', error.message);
      }
    };

    fetchVerificationData();
  }, [userId]);

  const handleAddVerification = async () => {
    
    try {
      await axios.post(`http://localhost:8000/users/${userId}/verification`, { verification: verificationInput });
      setShowVerificationModal(false);
    } catch (error) {
      console.error('Doğrulama bilgileri eklenirken bir hata oluştu:', error.message);
    }
  };


 useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye


    return () => clearTimeout(timer);
  }, []);

  return (
    
    <View style={{ flex: 1 }}>
      {loading ? (

      <Loading/>
    ) : (
      <>

      <Tab.Navigator 
        screenOptions={{ headerShown: false, tabBarStyle: { height:90, backgroundColor: '#e2eed6' } }}
        
      >
          <Tab.Screen 
            name="Üretici" 
            component={UreticiMyProducts}
            options={{
              tabBarLabel: 'Ürünler',
              tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons name='food-apple' color={focused ? '#729c44' : 'gray'} size={50} />
              ),
              tabBarActiveTintColor: 'green',
            }}
          />
          <Tab.Screen 
            name="AddProduct" 
            component={AddProduct}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ color, size, focused }) => (
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 90,
                    backgroundColor: focused ? '#fff' : '#729c44', // Change the background color as needed
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -20 // Adjust this value according to your need
                  }}
                >
                  <MaterialCommunityIcons name='plus-circle-outline' color={focused ? '#729c44' : '#fff'} size={80} />
                </View>
              ),
          
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons name='account' color={focused ? '#729c44' : 'gray'} size={55} />
              ),
              tabBarActiveTintColor: '#729c44',
            }}
          />
        </Tab.Navigator>
        </>
      )}


      {/* Verification modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <View style={{flexDirection:'row'}}>
              <Text style={styles.heading}>Doğrulama Bilgileri     </Text>
              <MaterialCommunityIcons name='close' size={40} color={'#729c44'} onPress={setShowVerificationModal}/>
            </View>

            <View style={{flexDirection:'row'}}>
            <MaterialCommunityIcons name='alert' size={22} color={"red"} style={{marginTop:5}}/>
              <Text style={{fontSize:17,color:"red",padding:5}}>Lütfen devam etmek için eksik bilgilerinizi tamamlayın.</Text>
            </View>

            <View style={{flexDirection:'row'}}>
            <TextInput
              style={{
                flex:0.5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
                padding: 10,
                marginTop: 15,
                marginRight:2
              }}
              placeholder="Şehir"
              value={verificationInput.producerAddress.city}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, producerAddress: { ...verificationInput.producerAddress, city: text } })}
            />
            <TextInput
              style={{
                flex:0.5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
                padding: 10,
                marginTop: 15,
                marginLeft:2
              }}
              placeholder="İlçe"
              value={verificationInput.producerAddress.district}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, producerAddress: { ...verificationInput.producerAddress, district: text } })}
            />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Sokak"
              value={verificationInput.producerAddress.street}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, producerAddress: { ...verificationInput.producerAddress, street: text } })}
            />
            <TextInput
              style={styles.input}
              placeholder="IBAN"
              value={verificationInput.paymentInfo.iban}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, paymentInfo: { ...verificationInput.paymentInfo, iban: text } })}
            />
            <Text style={{fontSize:10}}>*Ürün satışı veya iadesi ardından ücret yatırmak için kullanılacaktır</Text>
            <TextInput
              style={styles.input}
              placeholder="Hesap Numarası"
              value={verificationInput.paymentInfo.accountNumber}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, paymentInfo: { ...verificationInput.paymentInfo, accountNumber: text } })}
            />
            <Text style={{fontSize:10}}>*Ürün satışı veya iadesi ardından ücret yatırmak için kullanılacaktır</Text>
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              value={verificationInput.description}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, description: text })}
            />

            <TouchableOpacity style={{alignItems:'center', marginHorizontal:100, borderWidth:1, borderRadius:7, borderColor: '#377d38' , backgroundColor:'#729c44', margin:15}} onPress={handleAddVerification}>
              <Text style={{margin:7, color:'white', fontSize:18}}>KAYDET</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5, 
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft:5
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
  },
});


export default UreticiScreen;
