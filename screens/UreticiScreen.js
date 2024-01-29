import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProduct from '../components/AddProduct';
import ProfileScreen from '../components/Profile';
import UreticiMyProducts from '../components/UreticiMyProducts';

const Tab = createBottomTabNavigator();

const UreticiScreen = () => {
  return (
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
  );
};

export default UreticiScreen;
