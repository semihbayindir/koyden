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
  const [producerInfo, setProducerInfo] = useState();
  const [orderQuantity, setOrderQuantity] = useState('-'); // Sipariş miktarı state'i
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
  })
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
      <View style={{flexDirection:'row', marginTop:8,backgroundColor:'#cde8b5',borderRadius:15, margin:10, padding:4}}>
          <Text style={styles.productHead}>Üretici Bilgileri:</Text>
          <Text style={styles.productInfo}>{producerInfo.producer.name} {producerInfo.producer.surname}</Text>
          <Text style={styles.productInfo}>Ürün Kalitesi: {producerInfo.producer.qualityRating.productQuality}</Text>
          <Text style={styles.productInfo}>Güvenilirlik: {producerInfo.producer.qualityRating.reliability}</Text>
          <Text style={styles.productInfo}>Paketleme: {producerInfo.producer.qualityRating.serviceQuality}</Text>
          <Image source={{ uri: producerInfo.producer.image }} style={{ width: 50, height: 50, borderRadius:30, alignSelf:'center'}} />


        </View>
      </View>

      {userType === 'tasiyici' && (
      <>
      <Text style={{fontSize:22, fontWeight:700, marginLeft:15}}>TEKLİF VER</Text>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom:20, marginRight:20}}>
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
          <View>
            <TouchableOpacity style={styles.buttonTrans} onPress={handlePriceOffer} >
              <Text style={{textAlign:'center', fontSize:20, color:'#fff', padding:10}}>Teklif Ver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
      )}
      

      {userType !== 'tasiyici' && (
        <>
        {userId == product.producerId && (
        <View style={{flexDirection:'row', flex:1, marginHorizontal:10}}>
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
        <TouchableOpacity style={[styles.buttonSepet ,{marginHorizontal:'3%'}]} onPress={handleAddToCart}>
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
    marginLeft:5,
    fontSize:22, 
  },
  productHead:{
    fontSize:22, 
    fontWeight:'700',
    flex:0.6,
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