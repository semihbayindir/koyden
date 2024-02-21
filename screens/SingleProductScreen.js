import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from '../components/UserIdDecoder';

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
  const userId = useUserIdDecoder();
  
  useEffect(() => {
    axios.get(`http://localhost:8000/products/${productId}`)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
      });
  }, [productId]);


  const handleAddToCart = async () => {
    try {
      // Kullanıcının sepetini almak için GET isteği
      const cartResponse = await axios.get(`http://localhost:8000/cart/${userId}`);
      const userCart = cartResponse.data;
      
      // Eğer kullanıcının sepeti bulunamadıysa yeni bir sepet oluştur
      if (!userCart) {
        const createCartResponse = await axios.post(`http://localhost:8000/cart/create`, {
          userId,
          productId
        });
        const addToCartResponse = await axios.put(`http://localhost:8000/cart/add/${userId}`, {
          productId
        });
        console.log('New cart created:', createCartResponse.data);
        console.log('Product added to cart:', addToCartResponse.data);
        Alert.alert('Ürün sepete eklendi.')
        return;
      }
      
      // Kullanıcının sepetinde eklemek istediği ürünü ara
      const existingProductIndex = userCart.products.findIndex(product => product.productId === productId);
      
      // Eğer ürün sepete daha önce eklenmemişse, sepete ekle
      if (existingProductIndex === -1) {
        const addToCartResponse = await axios.put(`http://localhost:8000/cart/add/${userId}`, {
          productId
        });
        console.log('Product added to cart:', addToCartResponse.data);
        Alert.alert('Ürün sepete eklendi.')
      } else {
        Alert.alert('Ürün zaten sepetinizde bulunmaktadır.');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };
  

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
       {userId == product.producerId && (
       <TouchableOpacity onPress={toggleUpdateModal}>
        <Text style={styles.button}>Güncelle</Text>
      </TouchableOpacity>
       )}
      {/* Silme Butonu */}
      {userId == product.producerId && (
      <TouchableOpacity onPress={handleDeleteProduct}>
        <Text style={styles.button}>Sil</Text>
      </TouchableOpacity>
      )}
      {userId !== product.producerId && (
      // Sepete Ekle Butonu
      <TouchableOpacity onPress={handleAddToCart}>
        <Text style={styles.button}>Sepete Ekle</Text>
      </TouchableOpacity>
    )}


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