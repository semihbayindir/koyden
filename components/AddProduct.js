import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserIdDecoder } from './UserIdDecoder';

import { useNavigation } from '@react-navigation/native'; // React Navigation'ın useNavigation hook'u



const AddProduct = () => {
    const [isModalVisible, setModalVisible] = useState(true);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [minOrderQuantity, setMinOrderQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [products, setProducts] = useState([]);
    const producerId = useUserIdDecoder();

    const navigation = useNavigation(); 

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (producerId) {
        axios.get(`http://localhost:8000/products/producer/${producerId}`)
          .then(response => {
            setProducts(response.data);
          })
          .catch(error => {
            console.error('Error fetching products:', error);
          });
      }
    }, [producerId]);
    

  
    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };
  
  
  
  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (permissionResult.granted === false) {
        alert('Permission to access gallery is required!');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        // Set the selected image URI
        setProductImage(result.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const clearProductData = () => {
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductQuantity('');
    setMinOrderQuantity('');
    setUnitPrice('');
    setProductImage(null);
  };
  
  
  const handleAddProduct = async () => {
    try {
      // AWS S3'ye görsel yüklemesi
      const formData = new FormData();
      // Tarih ve saat bilgisini kullanarak dosya adını oluştur
      const timestamp = new Date().toISOString().replace(/:/g, '_');
      const fileName = `product_image_${timestamp}.jpg`;
  
      formData.append('image', {
        name: `product_image_${timestamp}.jpg`,
        type: 'image/jpg',
        uri: productImage,
      });
  
      const s3Response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const imageUrl = s3Response.data.imageUrl;
  
      const productData = {
        name: productName,
        description: productDescription,
        images: [imageUrl], // AWS S3'den alınan URL
        category: productCategory,
        qty: productQuantity,
        minQty: minOrderQuantity,
        price: unitPrice,
        producerId: producerId
      };
  
      // Sunucuya yeni ürünü ekle
      const response = await axios.post('http://localhost:8000/products', productData);
  
      console.log('Product added successfully:', response.data);
      toggleModal();
      clearProductData();
      handleResetScreen();
      // Ürün eklendikten sonra navigasyon işlemini gerçekleştir
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  const handleResetScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Uretici' }], // Yeniden yüklemek istediğiniz ekranın adı
    });
  };

  
    return (
      <View style={styles.container}>
        <View isVisible={isModalVisible}>
          <ScrollView style={styles.modalContainer}>
             <Text style={{textAlign:'left', fontSize:32, fontWeight:700, paddingTop:12}} >Yeni Bir Ürün Ekleyin</Text>
                  
            <TouchableOpacity style={{ marginTop:15,
              padding:9,
              fontSize:22,
              width:'100%'}} onPress={handleImagePick}>
  
                <View style={{flexDirection:'row'}}>
                <MaterialCommunityIcons style={{marginLeft: 5}} name='file-image-plus-outline' color={'#729c44'} size={80} />
                {productImage && (
                  <Image source={{ uri: productImage }} style={{ width: 100, height: 100 }} />
                )}
                </View>
              <Text style={{marginTop:5}}>Ürün Fotoğrafı Ekleyin</Text>
              
            </TouchableOpacity>
       
            <TextInput
              style={styles.input}
              placeholder="Ürün Adı"
              value={productName}
              multiline={true}
              onChangeText={(text) => setProductName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              multiline={true}
              textAlignVertical='top'
              value={productDescription}
              onChangeText={(text) => setProductDescription(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Kategori"
              value={productCategory}
              onChangeText={(text) => setProductCategory(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Stok"
              value={productQuantity}
              onChangeText={(text) => setProductQuantity(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Min Sipariş Miktarı"
              value={minOrderQuantity}
              onChangeText={(text) => setMinOrderQuantity(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Birim Fiyatı"
              value={unitPrice}
              onChangeText={(text) => setUnitPrice(text)}
            />
            <TouchableOpacity style={{marginLeft:210, marginTop:25,borderWidth:1, borderRadius:7, borderColor: '#377d38' , backgroundColor:'#729c44', margin:10}} onPress={handleAddProduct}>
              <Text style={{margin:12, color:'white', fontSize:22}}>Ürün Ekle</Text>
            </TouchableOpacity>
            
          </ScrollView>
        </View>      
      </View>
      
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    butons:{
      margin:10,
      borderWidth:2,
      borderRadius:10,
      borderColor:'#9ab863',
      paddingHorizontal:10,
      padding:4,
    },

    input: {
      borderWidth:1,
      borderRadius:10,
      marginTop:15,
      padding:9,
      fontSize:22,
      width:'100%',
      maxWidth:'100%',
      alignSelf:'flex-start',
    },

    modalContainer: {
      backgroundColor: 'white',
      padding: 22,
      borderRadius: 15,
      flex:1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
  

  });

  export default AddProduct;