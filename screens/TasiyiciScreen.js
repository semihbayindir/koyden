

import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from '../components/Profile';
import { View, StyleSheet } from 'react-native';
import AllOrders from '../components/AllOrders';
import Map from '../components/Map';
import Loading from './loadings/MapLoading';
import MapLoading from './loadings/MapLoading';



const Tab = createBottomTabNavigator();
const TasiyiciScreen = () => {
const [loading, setLoading] = useState(true);


useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 3000); // 3 saniye


  return () => clearTimeout(timer);
}, []);


  return (
    <View style={{ flex: 1 }}>
       {loading ? (
        <MapLoading/>
        ) : (
        <>

      <Tab.Navigator 
        screenOptions={{headerShown: false, tabBarStyle: { height:90,backgroundColor: '#e2eed6', borderTopLeftRadius:30, borderTopRightRadius:30  } }}
      >
        <Tab.Screen 
          name="Tüketici" 
          component={AllOrders}
          options={{
            tabBarLabel: 'Siparişler',
            tabBarIcon: ({ color, size , focused }) => (
              <MaterialCommunityIcons name='food-apple' color={focused ?'#729c44' : 'gray'} size={50} />
            ),
            tabBarActiveTintColor: 'green',
          }}
        />
        <Tab.Screen 
            name="Map" 
            component={Map}
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
                  <MaterialCommunityIcons name='map-outline' color={focused ? '#729c44' : '#fff'} size={65} />
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
            tabBarIcon: ({ color, size, focused  }) => (
              <MaterialCommunityIcons name='account' color={focused ? '#729c44' : 'gray'} size={55} />
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


export default TasiyiciScreen;


