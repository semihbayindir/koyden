import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProduct from '../components/AddProduct';
import ProfileScreen from '../components/Profile';
import UreticiMyProducts from '../components/UreticiMyProducts';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { decode as atob } from 'base-64';
import { Text, View, Modal, TextInput, Button, StyleSheet } from 'react-native';


const Tab = createBottomTabNavigator();
const UreticiScreen = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator 
        screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#e2eed6' } }}
      >
        <Tab.Screen 
          name="Üretici" 
          component={UreticiMyProducts}
          options={{
            tabBarLabel: 'Ürünler',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='food-apple' color={'#729c44'} size={40} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
        <Tab.Screen 
          name="AddProduct" 
          component={AddProduct}
          options={{
            tabBarLabel: 'Ürün Ekle',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='plus-circle-outline' color={'#729c44'} size={40} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='account' color={'#729c44'} size={45} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
      </Tab.Navigator>

      {/* Verification modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.heading}>Doğrulama Bilgileri</Text>
            <TextInput
              style={styles.input}
              placeholder="Şehir"
              value={verificationInput.producerAddress.city}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, producerAddress: { ...verificationInput.producerAddress, city: text } })}
            />
            <TextInput
              style={styles.input}
              placeholder="İlçe"
              value={verificationInput.producerAddress.district}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, producerAddress: { ...verificationInput.producerAddress, district: text } })}
            />
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
            <TextInput
              style={styles.input}
              placeholder="Hesap Numarası"
              value={verificationInput.paymentInfo.accountNumber}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, paymentInfo: { ...verificationInput.paymentInfo, accountNumber: text } })}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              value={verificationInput.description}
              onChangeText={(text) => setVerificationInput({ ...verificationInput, description: text })}
            />
            <Button title="Kaydet" onPress={handleAddVerification} />
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
    padding: 20,
    borderRadius: 10,
    elevation: 5, 
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
  },
});


export default UreticiScreen;
