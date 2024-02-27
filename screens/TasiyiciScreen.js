

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from '../components/Profile';

import { View, StyleSheet } from 'react-native';
import AllOrders from '../components/AllOrders';
import Map from '../components/Map';


const Tab = createBottomTabNavigator();
const TasiyiciScreen = () => {

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator 
        screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#e2eed6' } }}
      >
        <Tab.Screen 
          name="Tüketici" 
          component={AllOrders}
          options={{
            tabBarLabel: 'Siparişler',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='food-apple' color={'#729c44'} size={40} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
        <Tab.Screen 
          name="Map" 
          component={Map}
          options={{
            tabBarLabel: 'Harita',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name='map' color={'#729c44'} size={40} />
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


export default TasiyiciScreen;


