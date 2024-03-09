// SingleProductScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StyleSheet, Alert, TextInput, Button } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from '../components/UserIdDecoder';
import UpdateProduct from '../components/UpdateProduct';
import { useNavigation } from '@react-navigation/native'; // React Navigation'ın useNavigation hook'u
import ModalDropdown from 'react-native-modal-dropdown'; 



const SingleProductScreen = ({ route }) => {
  const { productId } = route.params;
  const userType = route.params.userType;
  const [product, setProduct] = useState(null);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const userId = useUserIdDecoder();
  const [priceOffer,setPriceOffer] = useState(null);
  const [refreshFlag,setRefreshFlag] = useState(false);
  const navigation = useNavigation(); 



  const [orderQuantity, setOrderQuantity] = useState('2'); // Sipariş miktarı state'i
  const [quantityOptions, setQuantityOptions] = useState([]);

  const handleOrderQuantityChange = (quantity) => {
    setOrderQuantity(quantity);
  };



  useEffect(() => {
    axios.get(`http://localhost:8000/products/${productId}`)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
      });
  }, [productId,refreshFlag]);

  useEffect(() => {
    if (product) {
      const stockQuantity = parseInt(product.qty); // Ürün stok miktarı
      const minStock = parseInt(product.minQty);
      const options = Array.from({ length: stockQuantity }, (_, i) => (i + minQty).toString()); // 1'den stok miktarına kadar olan sayıları oluştur
      setQuantityOptions(options); // Seçenekleri güncelle
    }
  }, [product]);





  const handleAddToCart = async () => {
    try {
      // Dropdown'dan seçilen miktarı al
      const quantity = parseInt(orderQuantity);
  
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
          productId,
          quantity
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
          productId,
          quantity
        });
        console.log('Product added to cart:', addToCartResponse.data);
        Alert.alert('Ürün sepete eklendi.')
        handleResetScreen();
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
    setRefreshFlag(prevState => !prevState);
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
        <View style={styles.inputContainer}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Sipariş Miktarı:</Text>
        <ModalDropdown
          options={quantityOptions}
          defaultValue={orderQuantity}
          onSelect={(index, value) => handleOrderQuantityChange(value)}
          style={{ fontSize: 22, marginBottom:5, marginLeft:10}}
          textStyle={{ fontSize: 22, color: 'gray', borderWidth: 1, borderRadius: 10, padding: 9, backgroundColor:'white' }}
          dropdownStyle={{ fontSize: 22, height: 200}}
          dropdownTextStyle={{ fontSize: 22 }} 
          dropdownTextHighlightStyle={{ color: 'green' }} 
        />
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
          <Text style={{color: 'white', fontSize:22 , textAlign:'center',padding:10 }}>Güncelle</Text>
        </TouchableOpacity>
      )}

        {userId == product.producerId && (
        <TouchableOpacity style={{backgroundColor: 'red',
        marginVertical: 9,
        borderRadius: 5,
        marginHorizontal: '20%',
        marginBottom:20,}} onPress={handleDeleteProduct}>
          <Text style={{ color: 'white', fontSize:22 , textAlign:'center',padding:10 }}>Sil</Text>
        </TouchableOpacity>
      )}

      {/* Sepete Ekle Butonu */}
        {userId !== product.producerId && (
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={{ color: 'white', fontSize:22 , textAlign:'center',padding:10}}>Sepete Ekle</Text>
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
    marginVertical: 9,
    borderRadius: 5,
    marginHorizontal: '20%',
    marginTop: 10,
    marginBottom:10,
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
    width:'20%',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    backgroundColor:'white'
  },
  currencySymbol: {
    marginLeft: 10,
    fontSize: 25,
    fontWeight: 'bold',
    
  },
});

export default SingleProductScreen;