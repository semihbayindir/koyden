import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView } from 'react-native';
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
    <ScrollView>
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


       {/* Güncelleme Butonu */}
       <TouchableOpacity style={{
        backgroundColor: '#729c44',
        borderRadius:5,
        padding: 13,
        marginVertical: 5,
        alignSelf:'center',
        width:'80%',
        marginHorizontal:8,
        marginTop:17}} onPress={toggleUpdateModal}>
        <Text style ={{
          color: 'white',
          textAlign: 'center',
          fontSize:22}} >Güncelle</Text>
      </TouchableOpacity>

      {/* Silme Butonu */}
      <TouchableOpacity style={{
        backgroundColor: 'red',
        borderRadius:5,
        padding: 15,
        alignSelf:'center',
        width:'80%',
        marginVertical: 5,
        marginHorizontal:8,
        marginTop:10}} onPress={handleDeleteProduct}>
        <Text style={{
          color: 'white',
          textAlign: 'center',
          fontSize:22}}>Sil</Text>
      </TouchableOpacity>

    {/* Güncelleme Modalı */}
    <Modal visible={isUpdateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={{fontSize:30, fontWeight:'700', marginBottom:40}}>Ürün Bilgilerini Güncelle</Text>
         
        <View style={{backgroundColor:'#cde8b5',borderRadius:15,width:'85%',padding:20, marginBottom:15}}>
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

        <View style={{flexDirection:'row'}}>
          <TextInput
            style={{
              flex:0.5,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              padding: 10,
              marginVertical:5,
              fontSize:18
              }}
            placeholder={qty.toString()}
            value={updatedProductQuantity}
            onChangeText={setUpdatedProductQuantity}
          />
          <TextInput
            style={{
              flex:0.5,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              padding: 10,
              marginVertical: 5,
              marginLeft:4,
             
              fontSize:18

              }}
            placeholder={ minQty.toString()}
            value={updatedMinOrderQuantity}
            onChangeText={setUpdatedMinOrderQuantity}
          />
        </View>

          <TextInput
            style={styles.input}
            placeholder={price.toString()}
            value={updatedUnitPrice}
            onChangeText={setUpdatedUnitPrice}
          />

          </View>

          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
              <Text style={{ color: 'white',fontSize:22 }}>Güncelle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor: 'red',
              color: 'white',
              textAlign: 'center',
              padding: 10,
              marginVertical: 5,
              borderRadius: 5,
              marginHorizontal:8,
              marginTop:15}} onPress={toggleUpdateModal}>
              <Text style={{ color: 'white', fontSize:22}}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        marginHorizontal:8,
        marginTop:15
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
      width: '100%',
      fontSize:22
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

    }
  });
  
  export default SingleProductScreen;