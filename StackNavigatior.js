import { Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation, route }) => ({
              title: 'KÖYDEN',
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
  name="Uretici"
  component={UreticiScreen}
  options={({ navigation }) => ({
    title: 'KÖYDEN',
    headerBackTitle: '‎',
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <MaterialCommunityIcons name="less-than" size={24} color="#fff" />
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
          title: 'KÖYDEN',
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
        name="UreticiOrders"
        component={UreticiOrders}
        options={{
          title: 'KÖYDEN',
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
        name="UreticiMyProducts"
        component={UreticiMyProducts}
        options={{
          title: 'KÖYDEN',
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