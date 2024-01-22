import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import UreticiScreen from "./screens/UreticiScreen";

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'KÖYDEN',
            headerLeft:null,
            headerStyle: {
              backgroundColor: '#304D10',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitleAlign:'center'
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          
          options={{
            headerLeft: (props) => null,
            title: 'KÖYDEN',
            headerStyle: {
              backgroundColor: '#304D10',
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
            headerStyle: {
              backgroundColor: '#304D10',
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
          options={{
            title: 'KÖYDEN',
            headerBackTitle: '‎',
            headerStyle: {
              backgroundColor: '#304D10',
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