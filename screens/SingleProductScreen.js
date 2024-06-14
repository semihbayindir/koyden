// SingleProductScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StyleSheet, Alert, TextInput, Button, LogBox } from 'react-native';
import axios from 'axios';
import { useUserIdDecoder } from '../components/UserIdDecoder';
import UpdateProduct from '../components/UpdateProduct';
import { useNavigation } from '@react-navigation/native'; // React Navigation'ın useNavigation hook'u
import ModalDropdown from 'react-native-modal-dropdown'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';



const SingleProductScreen = ({ route }) => {
  const { productId } = route.params;
  const userType = route.params.userType;
  const [product, setProduct] = useState(null);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const userId = useUserIdDecoder();
  const [priceOffer,setPriceOffer] = useState(null);
  const [refreshFlag,setRefreshFlag] = useState(false);
  const [producerInfo, setProducerInfo] = useState();
  const [orderQuantity, setOrderQuantity] = useState('-'); // Sipariş miktarı state'i
  const [quantityOptions, setQuantityOptions] = useState([]);
  const handleOrderQuantityChange = (quantity) => {
    setOrderQuantity(quantity);
  };

  LogBox.ignoreLogs([
   'initialScrollIndex "-1" is not valid (list has 100 items)',
  ]);
  LogBox.ignoreLogs([
    'initialScrollIndex "-1" is not valid (list has 40 items)',
   ]);



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

  useEffect(() => {
    if(product){
      axios.get(`http://localhost:8000/producer/${product.producerId}`)
      .then(response => {
        setProducerInfo(response.data);
      })
      .catch(error => {
        console.error('Error fetching producerInfo', error);
      })
    }
  }, [product,producerInfo])
  const handleAddToCart = async () => {
    try {
      const quantity = parseInt(orderQuantity);
      const cartResponse = await axios.get(`http://localhost:8000/cart/${userId}`);
      const userCart = cartResponse.data;
  
      if (!userCart) {
        const createCartResponse = await axios.post(`http://localhost:8000/cart/create`, {
          userId,
        });
        const addToCartResponse = await axios.put(`http://localhost:8000/cart/add/${userId}`, {
          productId,
          quantity,
        });
        console.log('New cart created:', createCartResponse.data);
        console.log('Product added to cart:', addToCartResponse.data);
        Alert.alert('Ürün sepete eklendi.');
        return;
      }
  
      const existingProductIndex = userCart.products.findIndex(product => product.productId === productId);
  
      if (existingProductIndex === -1) {
        const addToCartResponse = await axios.put(`http://localhost:8000/cart/add/${userId}`, {
          productId,
          quantity,
        });
        console.log('Product added to cart:', addToCartResponse.data);
        Alert.alert('Ürün sepete eklendi.');
      } else {
        const existingProduct = userCart.products[existingProductIndex];
        const newQuantity = existingProduct.quantity + quantity;
        const updateCartResponse = await axios.put(`http://localhost:8000/cart/update/${userId}`, {
          productId,
          quantity: newQuantity,
        });
        console.log('Product quantity updated in cart:', updateCartResponse.data);
        Alert.alert('Ürünün miktarı güncellendi.');
      }
      handleResetScreen();
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
      <Image source={{ uri: images[0] }} style={{ width: 250, height: 250, margin:15, marginTop:30, borderRadius:30, alignSelf:'center'}} />
      <View >
          <Text style={{fontSize:26, fontWeight:800, textAlign:'center', marginLeft:15}}>{name}</Text>
      </View>
        <View style={{marginTop:20}}>
        <View style={{ marginTop:8, flex:1,backgroundColor:'#ed896f',borderRadius:15, margin:10, padding:4}}>
          <Text style={styles.productHead}>Açıklama:</Text>
          <Text style={{flex:1, marginLeft:15, marginRight:15,fontSize:22, }}>{description}</Text>
        </View>
        <View style={{flexDirection:'row', marginTop:8,backgroundColor:'#cde8b5',borderRadius:15, margin:10, padding:4}}>
          <Text style={styles.productHead}>Kategori:</Text>
          <Text style={styles.productInfo}>{category}</Text>
        </View>
        <View style={{flexDirection:'row', marginTop:8, backgroundColor:'#cde8b5',borderRadius:15, margin:10, padding:4}}>
          <Text style={styles.productHead}>Birim Fiyatı: </Text>
          <Text style={styles.productInfo}>{price} ₺</Text>
        </View>
        <View style={{flexDirection:'row', marginTop:8, marginBottom:10,backgroundColor:'#cde8b5',borderRadius:15, margin:10, padding:4}}>
        <Text style={styles.productHead}>Sipariş Miktarı:</Text>
        <ModalDropdown
          options={quantityOptions}
          defaultValue={orderQuantity}
          onSelect={(index, value) => handleOrderQuantityChange(value)}
          style={{ fontSize: 22, marginBottom:5, marginLeft:'15%', borderRadius: 10, paddingHorizontal:15, backgroundColor:'white' }}
          textStyle={{ fontSize: 22, color: 'gray' }}
          dropdownStyle={{ fontSize: 22, height: 200, borderRadius: 10, padding: 9, backgroundColor:'white', }}
          dropdownTextStyle={{ fontSize: 22 }} 
          dropdownTextHighlightStyle={{ color: 'green' }} 
        />
      </View>
      <View style={{flexDirection: 'row', marginTop: 8, backgroundColor: '#cde8b5', borderRadius: 15, margin: 10, padding: 4}}>
  {producerInfo && (
    <View>
      <Text style={styles.productHead1}>Üretici Bilgileri:</Text>
      <Text style={[styles.productInfo1, {marginTop: 10}]}>{producerInfo.producer.name} {producerInfo.producer.surname}</Text>
      {producerInfo.producer.qualityRating && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {producerInfo.producer.image ? (
            <Image source={{ uri: producerInfo.producer.image }} style={{ width: 70, height: 70, borderRadius: 50, margin: 20, marginLeft: 40 }} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={80} style={{ margin: 20, marginLeft: 40, color:'#de510b' }} />
          )}
          <View style={{ marginRight: 10 }}>
            <Text style={styles.productInfo1}>Ürün Kalitesi: {producerInfo.producer.qualityRating.productQuality}</Text>
            <Text style={styles.productInfo1}>Güvenilirlik: {producerInfo.producer.qualityRating.reliability}</Text>
            <Text style={styles.productInfo1}>Paketleme: {producerInfo.producer.qualityRating.serviceQuality}</Text>
          </View>
        </View>
      )}
      {!producerInfo.producer.qualityRating && (
        <View style={{flexDirection:'row'}}>
        {producerInfo.producer.image ? (
          <Image source={{ uri: producerInfo.producer.image }} style={{ width: 70, height: 70, borderRadius: 50, margin: 20, marginLeft: 40 }} />
        ) : (
          <MaterialCommunityIcons name="account-circle" size={80} style={{ margin: 20, marginLeft: 40, color:'#de510b' }} />
        )}
        <View>
          <Text style={styles.productInfo}>Üretici daha önce değerlendirilmemiş.</Text>
        </View>
        </View>
      )}
    </View>
  )}

        </View>
      </View>
      

      {userType !== 'tasiyici' && (
        <>
        {userId == product.producerId && (
        <View style={{flexDirection:'row', flex:1, marginHorizontal:10, marginBottom:20}}>
        <TouchableOpacity style={styles.button} onPress={toggleUpdateModal}>
          <Text style={{color: 'white', fontSize:22 , textAlign:'center',padding:10 }}>Güncelle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor: 'red',borderRadius: 15, flex:0.5, marginTop:20  }} onPress={handleDeleteProduct}>
          <Text style={{ color: 'white', fontSize:22 , textAlign:'center',padding:10}}>Sil</Text>
        </TouchableOpacity>
        </View>
      )}
{/* 
        {userId == product.producerId && (
        <TouchableOpacity style={{backgroundColor: 'red',
        borderRadius: 15,
        marginHorizontal: '20%',
        }} onPress={handleDeleteProduct}>
          <Text style={{ color: 'white', fontSize:22 , textAlign:'center',padding:10 }}>Sil</Text>
        </TouchableOpacity>
      )} */}

      {/* Sepete Ekle Butonu */}
        {userId !== product.producerId && (
        <TouchableOpacity style={[styles.buttonSepet ,{marginHorizontal:'3%',marginBottom:20}]} onPress={handleAddToCart}>
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
    borderRadius: 15,
    flex:0.5,
    marginTop: 20,
    marginRight:5
  },
  buttonSepet: {
    backgroundColor: '#729c44',
    borderRadius: 15,
    flex:0.5,
    marginTop: 30,
   
  },
  buttonTrans: {
    backgroundColor: '#729c44',
    borderRadius: 5,
    marginHorizontal: '3%2',
    marginTop: 10,
    marginBottom:10,
  },
  productInfo:{
    flex:0.4,
    marginLeft:15,
    marginTop:20,
    fontSize:22, 
  },
  productInfo1:{
    
    marginLeft:15,
    fontSize:22, 
  },
  productHead:{
    fontSize:22, 
    fontWeight:'700',
    flex:0.6,
    marginLeft:15
  },
  productHead1:{
    fontSize:22, 
    fontWeight:'700',
    
    marginLeft:15
  },
  inputContainer: {
    flexDirection: 'row',
    
    borderRadius: 5,
    
  },
  input: {
    width:'50%',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal:20,
    backgroundColor:'white',
    marginHorizontal:10
  },
  currencySymbol: {
    marginLeft: 10,
    marginTop:5,
    fontSize: 25,
    fontWeight: 600,
    
  },
});

export default SingleProductScreen;