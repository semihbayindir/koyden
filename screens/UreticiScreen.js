import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';

const UreticiScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>Üretici</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Profil!</Text>
    </View>
  );
}

function AddProduct() {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal}>
        <Text>Add Product!</Text>
      </TouchableOpacity>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text>This is the modal content</Text>
          <TouchableOpacity onPress={toggleModal}>
            <Text>Close Modal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Üretici" 
        component={UreticiScreen}
        options={{
          tabBarLabel: 'Ürünler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='arrow-up-bold' color={'green'} size={30} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddProduct" 
        component={AddProduct}
        options={{
          tabBarLabel: 'Ürün Ekle',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='plus-circle-outline' color={'green'} size={40} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='account' color={'green'} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default MyTabs;
