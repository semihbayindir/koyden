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
  const [meyveCount, setMeyveCount] = useState(0);
  const [sebzeCount, setSebzeCount] = useState(0);
  const [filteredCategory, setFilteredCategory] = useState(null);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/products`)
        .then(response => {
          setProducts(response.data);
          // Kategorilere göre ürün sayısını hesapla
          const meyveProducts = response.data.filter(product => product.category === 'meyve');
          const sebzeProducts = response.data.filter(product => product.category === 'sebze');
          setMeyveCount(meyveProducts.length);
          setSebzeCount(sebzeProducts.length);
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

  const handleCategoryFilter = (category) => {
    // Kategori filtresini kaldır
    setFilteredCategory(null);
    // Kategorilere göre ürünleri filtrele
    if (category === 'meyve') {
      const meyveProducts = products.filter(product => product.category === 'meyve');
      setProducts(meyveProducts);
    } else if (category === 'sebze') {
      const sebzeProducts = products.filter(product => product.category === 'sebze');
      setProducts(sebzeProducts);
    }
  };

  const handleShowAllProducts = () => {
    axios.get(`http://localhost:8000/products`)
      .then(response => {
        setProducts(response.data);

        setFilteredCategory(null); // Filtreleme kaldır
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  };

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
        <View style={styles.productInfo}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.productName}>{item.name}</Text>
            <TouchableOpacity style={{ alignItems: 'flex-end', marginRight: 7, flex: 0.3 }} onPress={() => handleAddToCart(item._id)}>
              <MaterialCommunityIcons name='plus-circle' size={40} color={'#de510b'} />
            </TouchableOpacity>
          </View>
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
    <View style={styles.container}>
      <Text style={{ textAlign: 'left', fontWeight: 200, fontSize: 30, fontStyle: 'italic' }}>Hoşgeldin
        <Text style={{ textAlign: 'left', fontWeight: 800, fontSize: 30, fontStyle: 'normal' }}> TÜKETİCİ,</Text>
      </Text>
      <SearchBar
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />
      <View >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
        <TouchableOpacity style={styles.buttons} onPress={handleShowAllProducts}>
          <Text style={styles.buttonText}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttons}>
          <Text style={styles.buttonText}>Bana özel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.buttonText}>Siparişlerim</Text>
        </TouchableOpacity>
        </View>
        {/* Kategori Butonları */}
        <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={styles.katButtons} onPress={() => handleCategoryFilter('meyve')}>
          <Text style={[styles.buttonText, {color:'#fff'}]}>Meyve ({meyveCount})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.katButtons} onPress={() => handleCategoryFilter('sebze')}>
          <Text style={[styles.buttonText, {color:'#fff'}]}>Sebze ({sebzeCount})</Text>
        </TouchableOpacity>
        </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    marginHorizontal: 15
  },
  buttons: {
    marginHorizontal: 10,
    backgroundColor:'#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical:8
  },
  katButtons:{
    marginHorizontal: 10,
    marginBottom:10,
    borderRadius: 12,
    backgroundColor:'#de510b',
    paddingHorizontal: 10,
    paddingVertical:6
  },
  buttonText:{
    fontSize:20,
  },
  urunler: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 20,
    width: '45%',
    justifyContent: 'center',
    marginBottom: 10,
  },
  images: {
    width: '100%',
    height: 140,
    marginBottom: 10,
    borderRadius: 20,
    resizeMode: 'cover'
  },
  productName: {
    fontSize: 18,
    padding: 5,
    flex: 0.7
  },
  productFrom: {
    fontSize: 18,
    paddingLeft: 5,
    paddingBottom: 10,
    color: 'green',
    flex: 0.7
  },
  productPrice: {
    fontSize: 18,
    flex: 0.3,
    paddingBottom: 10,
  },
  productDet: {
    flexDirection: 'row',
    flex: 1
  }
});

export default AllProducts;
