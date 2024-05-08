import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';
import SearchBar from './SearchBar';
import { fuzzySearch } from './FuzzySearch';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';



const AllProducts = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const userId = useUserIdDecoder();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/products`)
        .then(response => {
          setProducts(response.data);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        }).finally(() => {
          // Ürünler yüklendiğinde bekleme süresini başlat
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        });
    }
  }, [userId]);
  
  
  const handleProductPress = (productId) => {
    navigation.navigate('SingleProduct', { productId: productId });
  };




  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(`http://localhost:8000/cart/add/${userId}`, {
        productId,
        quantity: 1 // Üründen sadece bir adet sepete eklenecek
      });
      console.log('Product added to cart:', response.data);
      Alert.alert('Ürün sepete eklendi.');
    } catch (error) {
      console.log(userId)
      console.error('Error adding product to cart:', error);
    }
  };
  






  const [producerInfos, setProducerInfos] = useState([]);

useEffect(() => {
  const fetchProducerInfo = async () => {
    try {
      const producerInfoPromises = products.map(async (product) => {
        const response = await axios.get(`http://localhost:8000/producer/${product.producerId}`);
        return response.data.producer;
      });
      const producerInfo = await Promise.all(producerInfoPromises);
      setProducerInfos(producerInfo);
    } catch (error) {
      console.error('Error fetching producer information:', error);
    }
  };

  fetchProducerInfo();
}, [products]);


const renderProductItem = ({ item, index }) => {
  const producerInfo = producerInfos[index];
  return (
    <TouchableOpacity style={styles.urunler} onPress={() => handleProductPress(item._id)}>
      {item.images && item.images.length > 0 ? (
        <View>
          <Image style={styles.images} source={{ uri: item.images[0] }} /> 
          
        </View>
      ) : (
        <View />
      )}
     
      <View style={styles.prductInfo}>

        <View style={{flexDirection:'row', flex:1}}>
            <Text style={styles.productName}>{item.name}</Text>
            <TouchableOpacity style={{alignItems:'flex-end',marginRight:4, flex:0.3}} onPress={() => handleAddToCart(item._id)}>
            <MaterialCommunityIcons name='plus-circle' size={40} color={'#de510b'}/>
          </TouchableOpacity>
        </View>
        
        {/* <Text style={styles.producerAddress}>{producerInfo && producerInfo.verification.producerAddress.city}</Text> */}
        <View style={styles.productDet}>
          <Text style={styles.productFrom}>{producerInfo && producerInfo.verification.producerAddress.city}</Text>
          <Text style={styles.productPrice}>{item.price}₺</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
  const filteredProducts = fuzzySearch(searchKeyword, products);

  return (
    <View style={styles.welcome}>
      
          <Text style={{textAlign:'left', fontWeight:200, fontSize:30, fontStyle:'italic'}}>Hoşgeldin
            <Text style={{textAlign:'left', fontWeight:800, fontSize:30, fontStyle:'normal'}}>  TÜKETİCİ,</Text>
          </Text>
          <SearchBar
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
          <View style={{flexDirection:'row', alignItems:'center', marginTop:5, marginBottom:10}}>
            <TouchableOpacity style={styles.butons}>
              <Text style={{fontSize:18}}>Tümü</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.butons}>
              <Text style={{fontSize:18}}>Bana özel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.butons} onPress={() => navigation.navigate('Orders')}>
              <Text style={{fontSize:18}}>Siparişlerim</Text>
            </TouchableOpacity>
          </View>
          {filteredProducts.length === 0 && (
            <View>
              <Text>Aranan ürün bulunamadı.</Text>
            </View>
          )}
          {filteredProducts.length > 0 && (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
              numColumns={2}
            />
          )}
      
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
      marginTop:15,
      marginHorizontal:15
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
      backgroundColor:'#fff',
      marginHorizontal:10,
      borderRadius:20,
      width: '45%',
      justifyContent:'center',
      marginBottom:10,
    },
    images: {
      width: '100%',
      height: 140,
      marginBottom:10,
      borderRadius:20
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
      flex:0.7
    },
    productFrom:{
      fontSize:18, 
      paddingLeft:5, 
      paddingBottom:10,
      color:'green',
      flex:0.7
    },
    productPrice:{
      fontSize:18, 
      flex:0.3,
      paddingBottom:10,

    },
    productDet:{
      flexDirection:'row',
      flex:1
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

  export default AllProducts;