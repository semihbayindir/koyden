import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import axios from 'axios';

const SingleProductScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedProductName, setUpdatedProductName] = useState(name);
  const [updatedProductDescription, setUpdatedProductDescription] = useState(description);
  const [updatedProductCategory, setUpdatedProductCategory] = useState(category);
  const [updatedProductQuantity, setUpdatedProductQuantity] = useState(qty);
  const [updatedMinOrderQuantity, setUpdatedMinOrderQuantity] = useState(minQty);
  const [updatedUnitPrice, setUpdatedUnitPrice] = useState(price);

  useEffect(() => {
    axios.get(`http://localhost:8000/products/${productId}`)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
      });
  }, [productId]);

  if (!product) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  function toggleUpdateModal(){
    setUpdateModalVisible(!isUpdateModalVisible);

  }

  const handleDeleteProduct = async () => {
    try {
        const response = await axios.delete(`http://localhost:8000/products/${productId}`);
        console.log('Product deleted successfully:', response.data);
    } catch (error) {
        console.error('Error deleting product:', error);
      }
  };

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
      toggleUpdateModal();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const { name, description, category, qty, minQty, price, images } = product;

  return (
    <View>
      <Text>Ürün Adı: {name}</Text>
      <Text>Açıklama: {description}</Text>
      <Text>Kategori: {category}</Text>
      <Text>Stok: {qty} kg</Text>
      <Text>Min Sipariş Miktarı: {minQty}</Text>
      <Text>Birim Fiyatı: {price} ₺</Text>
      <Image source={{ uri: images[0] }} style={{ width: 200, height: 200 }} />
       {/* Güncelleme Butonu */}
       <TouchableOpacity onPress={toggleUpdateModal}>
        <Text style={styles.button}>Güncelle</Text>
      </TouchableOpacity>

      {/* Silme Butonu */}
      <TouchableOpacity onPress={handleDeleteProduct}>
        <Text style={styles.button}>Sil</Text>
      </TouchableOpacity>

    {/* Güncelleme Modalı */}
    <Modal visible={isUpdateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder={name}
            value={updatedProductName}
            onChangeText={setUpdatedProductName}
          />
          <TextInput
            style={styles.input}
            placeholder={description}
            value={updatedProductDescription}
            onChangeText={setUpdatedProductDescription}
          />
          <TextInput
            style={styles.input}
            placeholder={category}
            value={updatedProductCategory}
            onChangeText={setUpdatedProductCategory}
          />
          <TextInput
            style={styles.input}
            placeholder={qty.toString()}
            value={updatedProductQuantity}
            onChangeText={setUpdatedProductQuantity}
          />
          <TextInput
            style={styles.input}
            placeholder={minQty.toString()}
            value={updatedMinOrderQuantity}
            onChangeText={setUpdatedMinOrderQuantity}
          />
          <TextInput
            style={styles.input}
            placeholder={price.toString()}
            value={updatedUnitPrice}
            onChangeText={setUpdatedUnitPrice}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
            <Text style={{ color: 'white' }}>Güncelle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleUpdateModal}>
            <Text style={{ color: 'white' }}>İptal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#729c44',
        color: 'white',
        textAlign: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
      },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: 10,
      marginVertical: 5,
      width: '80%',
    },
  });
  
  export default SingleProductScreen;