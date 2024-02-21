import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProduct from '../components/AddProduct';
import ProfileScreen from '../components/Profile';
import AllProducts from '../components/AllProducts';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { decode as atob } from 'base-64';
import { Text, View, Modal, TextInput, Button, StyleSheet } from 'react-native';
import Loading from './Loading';
import Cart from '../components/Cart';


const Tab = createBottomTabNavigator();
const UreticiScreen = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [userId, setUserId] = useState(null);

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

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator 
        screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#e2eed6' } }}
      >
        <Tab.Screen 
          name="Tüketici" 
          component={AllProducts}
          options={{
            tabBarLabel: 'Ürünler',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='food-apple' color={'#729c44'} size={40} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
        <Tab.Screen 
          name="Cart" 
          component={Cart}
          options={{
            tabBarLabel: 'Sepet',
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
