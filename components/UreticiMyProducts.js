import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';


const UreticiMyProducts = () => {
    const navigation = useNavigation();
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
  
    return (
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
  
        {/* <View style={{flexDirection:'row', marginTop:15 }}>
          <TouchableOpacity style={styles.urunler}>        
            <Image style={styles.images} source={require("../assets/üretici/GF-Apple-Orchard-lead-2048x2048.png")}></Image>
            <Text style={{fontSize:18, padding:5 }}>Amasya Elma</Text>
              <View style={{flexDirection:'row'}}>
                <Text style={{fontSize:18, paddingLeft:20, paddingBottom:10}}>5 kg</Text>
                <Text style={{fontSize:18, paddingLeft:30, paddingBottom:10}}>200 ₺</Text>
              </View>
            
          </TouchableOpacity>
          <TouchableOpacity style={styles.urunler}>
            <Image style={styles.images} source={require("../assets/üretici/Pasted-Graphic.png")}></Image>
            <Text style={{fontSize:18, padding:5 }}>Armut</Text>
            <View style={{flexDirection:'row'}}>
                <Text style={{fontSize:18, paddingLeft:20, paddingBottom:10}}>10 kg</Text>
                <Text style={{fontSize:18, paddingLeft:30, paddingBottom:10}}>450 ₺</Text>
              </View>
          </TouchableOpacity>
          </View> */}
          <View>
          <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
        />
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

  export default UreticiMyProducts;