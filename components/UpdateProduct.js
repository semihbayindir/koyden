// UpdateProduct.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // React Navigation'ın useNavigation hook'u


const UpdateProduct = ({ productId, onClose }) => {
  const [updatedProductName, setUpdatedProductName] = useState('');
  const [updatedProductDescription, setUpdatedProductDescription] = useState('');
  const [updatedProductCategory, setUpdatedProductCategory] = useState('');
  const [updatedProductQuantity, setUpdatedProductQuantity] = useState('');
  const [updatedMinOrderQuantity, setUpdatedMinOrderQuantity] = useState('');
  const [updatedUnitPrice, setUpdatedUnitPrice] = useState('');

  const navigation = useNavigation(); 

  const handleUpdateProduct = async () => {
    try {
      const updatedProductData = {
        name: updatedProductName,
        description: updatedProductDescription,
        category: updatedProductCategory,
        qty: updatedProductQuantity,
        minQty: updatedMinOrderQuantity,
        price: updatedUnitPrice,
      };

      const response = await axios.put(`http://localhost:8000/products/${productId}`, updatedProductData);
      console.log('Product updated successfully:', response.data);
      onClose();
      handleResetScreen();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleResetScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Uretici' }], // Yeniden yüklemek istediğiniz ekranın adı
    });
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Ürün Bilgilerini Güncelle</Text>
      <TextInput
        style={styles.input}
        placeholder="Ürün Adı"
        value={updatedProductName}
        onChangeText={setUpdatedProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Açıklama"
        value={updatedProductDescription}
        onChangeText={setUpdatedProductDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Kategori"
        value={updatedProductCategory}
        onChangeText={setUpdatedProductCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Stok"
        value={updatedProductQuantity}
        onChangeText={setUpdatedProductQuantity}
      />
      {/* Diğer input alanlarını ekleyin */}

      <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
        <Text style={styles.buttonText}>Güncelle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={onClose}>
        <Text style={styles.buttonText}>İptal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: '80%',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#729c44',
    borderRadius: 5,
    padding: 15,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateProduct;
