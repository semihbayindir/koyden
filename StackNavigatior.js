import { Button, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import UreticiScreen from "./screens/UreticiScreen";
import TuketiciScreen from "./screens/TuketiciScreen";
import SingleProductScreen from "./screens/SingleProductScreen";
import Orders from "./components/Orders";
import UreticiOrders from "./components/UreticiOrders";
import UreticiMyProducts from "./components/UreticiMyProducts";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Ionicons } from '@expo/vector-icons';

import TasiyiciScreen from "./screens/TasiyiciScreen";
import OrderDetails from "./components/OrderDetails";
import TasiyiciOrders from "./components/TasiyiciOrders";
import Route from "./components/Route";





// options={({ navigation, route }) => ({
//   title: 'KÖYDEN',
//   headerStyle: {
//     backgroundColor: '#729c44',

//   },
//   headerTintColor: '#fff',
//   headerTitleStyle: {
//     fontWeight: 'bold',
//   },
//   headerTitleAlign:'center'
//   })}


const StackNavigator = () => {



  function LogoTitle() {
    return (
      <Image
        style={{ width: 170, height: 50}}
        source={require('./assets/koyden1.png')}
      />
    );
  }



  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation, route }) => ({
              title: 'KÖYDEN',
             // headerTitle: (props) => <LogoTitle {...props} />,
              headerStyle: {
                backgroundColor: '#729c44',

              },
              headerBackVisible: false,
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerTitleAlign:'center'
              })}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          
          options={{
            headerLeft: ()=> null,
            title: 'KÖYDEN',
            //headerTitle: (props) => <LogoTitle {...props} />,
            headerStyle: {
              backgroundColor: '#729c44',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitleAlign:'center'
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'KÖYDEN',
           // headerTitle: (props) => <LogoTitle {...props} />,
            headerBackTitle: '‎',
            headerStyle: {
              backgroundColor: '#729c44',
            },
            headerBackVisible: false,
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Uretici"
          component={UreticiScreen}
          options={({ navigation }) => ({
            title: 'KÖYDEN',
           // headerTitle: (props) => <LogoTitle {...props} />,
            headerBackTitle: '‎',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>

                <Ionicons name="chevron-back" size={34} color="#fff" />

              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: '#729c44',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
    },        
  })}
/>
        <Stack.Screen
          name="Tuketici"
          component={TuketiciScreen}
          options={{
            title: 'KÖYDEN',
            //headerTitle: (props) => <LogoTitle {...props} />,
            headerBackTitle: '‎',
            headerStyle: {
              backgroundColor: '#729c44',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },        
          }}
        />
        <Stack.Screen
        name="Tasiyici"
        component={TasiyiciScreen}
        options={{
          title: 'KÖYDEN',
         // headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },        
        }}
        />
        <Stack.Screen
        name="SingleProduct"
        component={SingleProductScreen}
        options={{
          title: 'KÖYDEN',
          //headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },        
        }}
        />
        <Stack.Screen
        name="Orders"
        component={Orders}
        options={{
          title: 'Siparişlerim',
         // headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 22
          },        
        }}
        />
        <Stack.Screen
        name="UreticiOrders"
        component={UreticiOrders}
        options={{
          title: 'Siparişlerim',
          //headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize:22
          },        
        }}
        />
        <Stack.Screen
        name="UreticiMyProducts"
        component={UreticiMyProducts}
        options={{
          title: 'KÖYDEN',
          //headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },        
        }}
        />
        <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{
          title: 'Sipariş Detay',
         // headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize:20,
          },        
        }}
        />
        <Stack.Screen
        name="TasiyiciOrders"
        component={TasiyiciOrders}
        options={{
          title: 'KÖYDEN',
          //headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },        
        }}
        />
        <Stack.Screen
        name="Route"
        component={Route}
        options={{
          headerTitle: (props) => <LogoTitle {...props} />,
          headerBackTitle: '‎',
          headerStyle: {
            backgroundColor: '#729c44',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },        
        }}
        />
      </Stack.Navigator>
    
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
