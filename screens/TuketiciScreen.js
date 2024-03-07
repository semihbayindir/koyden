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
import Loading from './loadings/Loading';
import Cart from '../components/Cart';
import { useNavigation } from '@react-navigation/native';



const Tab = createBottomTabNavigator();
const UreticiScreen = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 5 saniye

    return () => clearTimeout(timer);
  }, []);

  const handleCartPress = () => {
    // Cart ekranını sıfırla ve yeniden yükle

    navigation.reset({
      index: 0,
      routes: [{ name: 'Cart' }],
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (

      <Loading/>
    ) : (
      <>
      <Tab.Navigator 
  screenOptions={{ headerShown: false, tabBarStyle: { height:90 ,backgroundColor: '#e2eed6' } }}
>
  <Tab.Screen 
    name="Tüketici" 
    component={AllProducts}
    options={{
      tabBarLabel: 'Ürünler',
      tabBarIcon: ({ color, size, focused }) => (
        <MaterialCommunityIcons name='food-apple'  color={focused ? '#729c44' : 'gray'} size={50} />
      ),
      tabBarActiveTintColor: 'green',
      unmountOnBlur: true
    }}
  />
  <Tab.Screen 
    name="Cart" 
    component={Cart}
    options={{
      tabBarLabel: '',
      tabBarIcon: ({ color, size, focused }) => (
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 80,
            backgroundColor: focused ? '#fff' : '#729c44', // Change the background color as needed
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -20 // Adjust this value according to your need
          }}
        >
          <MaterialCommunityIcons name='cart-variant' color={focused ? '#729c44' : '#fff'} size={60} 
                    onPress={handleCartPress} // onPress olayını kullanarak handleCartPress fonksiyonunu çağırın
                    />
        </View>
      ),
      tabBarActiveTintColor: 'green',
      
    }}
  />
  <Tab.Screen 
    name="Profile" 
    component={ProfileScreen}
    options={{
      tabBarLabel: 'Profil',
      tabBarIcon: ({ color, size , focused}) => (
        <MaterialCommunityIcons name='account'  color={focused ? '#729c44' : 'gray'} size={55} />
      ),
      tabBarActiveTintColor: 'green',
    }}
  />
</Tab.Navigator>
</>

      )}
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
