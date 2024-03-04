// SingleProductScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StyleSheet, Alert, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from '../components/UserIdDecoder';
import UpdateProduct from '../components/UpdateProduct';
import { useNavigation } from '@react-navigation/native'; // React Navigation'ın useNavigation hook'u


const SingleProductScreen = ({ route }) => {
  const { productId } = route.params;
  const userType = route.params.userType;
  const [product, setProduct] = useState(null);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const userId = useUserIdDecoder();
  const [priceOffer,setPriceOffer] = useState(null);
  
  const navigation = useNavigation(); 

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
  function toggleUpdateModal(){
    setUpdateModalVisible(!isUpdateModalVisible);

  }

  const handleDeleteProduct = async () => {
    try {
        const response = await axios.delete(`http://localhost:8000/products/${productId}`);
        handleResetScreen();
        console.log('Product deleted successfully:', response.data);
    } catch (error) {
        console.error('Error deleting product:', error);
      }
  };

  const handleResetScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Uretici' }], // Yeniden yüklemek istediğiniz ekranın adı
    });
  };

  const handlePriceOfferChange = (price) =>{
    setPriceOffer(price);
  }

  const handlePriceOffer = () => {

  }

  if (!product) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { name, description, category, qty, minQty, price, images } = product;

  return (
    <ScrollView>
      {/* Ürün detayları gösterimi */}
      <Image source={{ uri: images[0] }} style={{ width: 250, height: 250, margin:15, borderRadius:5, alignSelf:'center'}} />
      <View style={{backgroundColor:'#cde8b5',borderRadius:15, margin:10}}>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Ürün Adı:</Text>
          <Text style={styles.productInfo}>{name}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Açıklama:</Text>
          <Text style={styles.productInfo}>{description}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Kategori:</Text>
          <Text style={styles.productInfo}>{category}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Stok:</Text>
          <Text style={styles.productInfo}>{qty} kg</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Min Sipariş Miktarı:</Text>
          <Text style={styles.productInfo}>{minQty}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.productHead}>Birim Fiyatı: </Text>
          <Text style={styles.productInfo}>{price} ₺</Text>
        </View>
      </View>

      {userType === 'tasiyici' && (
      <>
      <Text>  TAŞIYICI KISMI BURAYA GELECEK -- TEKLİF VER</Text>
      <View style={styles.inputContainer}>
      <TextInput
      placeholder="Fiyat Teklifi"
      onChangeText={handlePriceOfferChange}
      value={priceOffer}
      keyboardType="numeric"
      style={styles.input}
      />
      <Text style={styles.currencySymbol}>₺</Text>
      </View>      
      <Button title="Fiyat Teklifi Ver" onPress={handlePriceOffer} />
      </>
      )}
      

      {userType !== 'tasiyici' && (
        <>
        {userId == product.producerId && (
        <TouchableOpacity style={styles.button} onPress={toggleUpdateModal}>
          <Text style={{ color: 'white', fontSize:22 }}>Güncelle</Text>
        </TouchableOpacity>
      )}

        {userId == product.producerId && (
        <TouchableOpacity style={styles.button} onPress={handleDeleteProduct}>
          <Text style={{ color: 'white', fontSize:22 }}>Sil</Text>
        </TouchableOpacity>
      )}

      {/* Sepete Ekle Butonu */}
        {userId !== product.producerId && (
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={{ color: 'white', fontSize:22 }}>Sepete Ekle</Text>
        </TouchableOpacity>
      )}
        </>
      )}
      {/* Güncelleme Modalı */}
      <Modal visible={isUpdateModalVisible} animationType="slide">
        <UpdateProduct
          productId={productId}
          onClose={toggleUpdateModal}
          product={product}
        />
      </Modal>
    </ScrollView>
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
    marginHorizontal: 8,
    marginTop: 15
  },
  productInfo:{
    margin:10, 
    padding:5, 
    fontSize:22, 
    borderColor:'gray',
    borderRadius:5,
  },
  productHead:{
    fontSize:22, 
    fontWeight:'700',
    marginTop:15, 
    marginLeft:15
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  currencySymbol: {
    marginLeft: 10,
    fontSize: 25,
    fontWeight: 'bold',
    
  },
});

export default SingleProductScreen;