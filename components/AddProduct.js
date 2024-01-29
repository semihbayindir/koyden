import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


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
  
    useEffect(() => {
      // Fetch products from the server
      axios.get("http://localhost:8000/products")
        .then(response => {
          setProducts(response.data);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        });
    }, []);
  
    const renderProductItem = ({ item }) => (
      <TouchableOpacity style={styles.urunler}>
        <Image style={styles.images} source={{ uri: item.images[0] }} /> 
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.productDet}>
            <Text style={styles.productQty}>{item.qty} kg</Text>
            <Text style={styles.productPrice}>{item.price} ₺</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  
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
  
      if (!result.cancelled) {
        // Set the selected image URI
        setProductImage(result.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  
    const handleAddProduct = async () => {
      try {
        // AWS S3'ye görsel yüklemesi
        const formData = new FormData();
        // Tarih ve saat bilgisini kullanarak dosya adını oluştur
        const timestamp = new Date().toISOString().replace(/:/g, '_');
        const fileName = `product_image_${timestamp}.jpg`;
  
        formData.append('image', {
          name: 'product_image.jpg',
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
      };
    
      // Sunucuya yeni ürünü ekle
      const response = await axios.post('http://localhost:8000/products', productData);
  
      console.log('Product added successfully:', response.data);
      toggleModal();
    } catch (error) {
      console.error('Error adding product:', error);
    }
    };
  
    return (
      <View style={styles.container}>
         
      <View style={styles.welcome}>
        <Text style={{textAlign:'left', fontWeight:200, fontSize:30, fontStyle:'italic'}}>Hoşgeldin
        <Text style={{textAlign:'left', fontWeight:800, fontSize:30, fontStyle:'normal' }}>  ÜRETİCİ,</Text>
        </Text>
        <View style={{flexDirection:'row', marginLeft:20, marginTop:10 }}>
          <TouchableOpacity style={styles.butons}>
            <Text style={{fontSize:18}}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butons}>
            <Text style={{fontSize:18}}>Siparişlerim</Text>
          </TouchableOpacity>
        </View>
        <View>
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
        />
        </View>
        
      </View>
      <TouchableOpacity style={{marginLeft: 300, marginBottom:10}} onPress={toggleModal}>
        <MaterialCommunityIcons  name='plus-box' color={'#729c44'} size={80} />
        </TouchableOpacity>
      
        
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContainer}>
                <View style={{flexDirection:'row'}}>
                  <Text style={{textAlign:'left', fontSize:24, fontWeight:500, paddingTop:12}} >Yeni Bir Ürün Ekleyin</Text>
                    <TouchableOpacity onPress={toggleModal}>
                      <MaterialCommunityIcons style={{marginLeft: 45}} name='close-box' color={'#729c44'} size={50} />
                    </TouchableOpacity>
                </View>
  
                <TouchableOpacity style={styles.input} onPress={handleImagePick}>
  
                <View style={{flexDirection:'row'}}>
                <MaterialCommunityIcons style={{marginLeft: 5}} name='file-image-plus-outline' color={'#729c44'} size={80} />
                {productImage && (
                  <Image source={{ uri: productImage }} style={{ width: 100, height: 100 }} />
                )}
                </View>
              <Text>Ürün Fotoğrafı Ekleyin</Text>
              
            </TouchableOpacity>
  
            
  
            <TextInput
              style={styles.input}
              placeholder="Ürün Adı"
              value={productName}
              onChangeText={(text) => setProductName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
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
            <TouchableOpacity style={{marginLeft:210 ,borderWidth:1, borderRadius:7, borderColor: '#377d38' , backgroundColor:'#729c44', margin:10}} onPress={handleAddProduct}>
              <Text style={{margin:5, color:'white', fontSize:18}}>Ürün Ekle</Text>
            </TouchableOpacity>
            
          </View>
        </Modal>
       
      </View>
      
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcome:{
      flex:1,
      margin:15,
    },
    butons:{
      margin:10,
      borderWidth:2,
      borderRadius:10,
      borderColor:'#9ab863',
      paddingHorizontal:10,
      padding:4
    },
    urunler:{
      backgroundColor:'#d8e3c3',
      marginHorizontal:10,
      borderWidth:2,
      borderRadius:10,
      borderColor:'#9ab863',
      width: '45%',
      justifyContent:'center',
      marginBottom:10,
    },
    images: {
      width: '100%',
      height: 140,
      marginTop:10,
      resizeMode: 'contain',
      
    },
    input: {
      borderWidth:1,
      borderRadius:10,
      marginTop:15,
      padding:9,
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 22,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderRadius: 15,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    productName:{
      fontSize:18, 
      padding:5,
    },
    productQty:{
      fontSize:18, 
      paddingLeft:20, 
      paddingBottom:10,
    },
    productPrice:{
      fontSize:18, 
      paddingLeft:30, 
      paddingBottom:10,
    },
    productDet:{
      flexDirection:'row',
    },
  
  
    profileHeader: {
      alignItems: 'center',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    username: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    userInfo: {
      marginTop: 20,
    },
    signOutButton: {
      marginTop: 20,
      backgroundColor: '#FF0000', // Customize the color as needed
      padding: 10,
      borderRadius: 5,
    },
    signOutText: {
      color: '#FFFFFF', // Customize the color as needed
      fontWeight: 'bold',
    },
  });

  export default AddProduct;