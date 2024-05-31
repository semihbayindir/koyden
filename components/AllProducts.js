import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUserIdDecoder } from './UserIdDecoder';
import SearchBar from './SearchBar';
import { fuzzySearch } from './FuzzySearch';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

const AllProducts = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const userId = useUserIdDecoder();
  const [loading, setLoading] = useState(true);
  const [meyveCount, setMeyveCount] = useState(0);
  const [sebzeCount, setSebzeCount] = useState(0);
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [producerInfos, setProducerInfos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/products`)
        .then(response => {
          setProducts(response.data);
          const meyveProducts = response.data.filter(product => product.category === 'meyve');
          const sebzeProducts = response.data.filter(product => product.category === 'sebze');
          setMeyveCount(meyveProducts.length);
          setSebzeCount(sebzeProducts.length);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        }).finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        });
    }
  }, [userId]);

  useEffect(() => {
    const fetchProducerInfo = async () => {
      try {
        const producerInfoPromises = products.map(async (product) => {
          const response = await axios.get(`http://localhost:8000/producer/${product.producerId}`);
          return response.data.producer;
        });
        const producerInfo = await Promise.all(producerInfoPromises);
        setProducerInfos(producerInfo);
        
        // Şehirleri ayıkla
        const citySet = new Set(producerInfo.map(producer => producer.verification.producerAddress.city));
        setCities(Array.from(citySet));
      } catch (error) {
        console.error('Error fetching producer information:', error);
      }
    };

    fetchProducerInfo();
  }, [products]);

  const handleProductPress = (productId) => {
    navigation.navigate('SingleProduct', { productId: productId });
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(`http://localhost:8000/cart/add/${userId}`, {
        productId,
        quantity: 1
      });
      console.log('Product added to cart:', response.data);
      Alert.alert('Ürün sepete eklendi.');
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleShowAllProducts = () => {
    axios.get(`http://localhost:8000/products`)
      .then(response => {
        setProducts(response.data);
        setFilteredCategory(null);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  };

  const filterProducts = (products, filter) => {
    switch (filter) {
      case 'alphabetical':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'priceAsc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'city':
        return products.filter(product => {
          const producer = producerInfos.find(p => p._id === product.producerId);
          return producer?.verification.producerAddress.city === selectedCity;
        });
      default:
        return products;
    }
  };

  const filteredProducts = filterProducts(fuzzySearch(searchKeyword, products.filter(product => !filteredCategory || product.category === filteredCategory)), selectedFilter);

  const renderProductItem = ({ item, index }) => {
    const producerInfo = producerInfos.find(p => p._id === item.producerId);
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

  return (
    <View style={styles.container}>
      <Text style={{ textAlign: 'left', fontWeight: 200, fontSize: 30, fontStyle: 'italic' }}>Hoşgeldin
        <Text style={{ textAlign: 'left', fontWeight: 800, fontSize: 30, fontStyle: 'normal' }}> TÜKETİCİ,</Text>
      </Text>
      <SearchBar
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
          <TouchableOpacity style={styles.buttons} onPress={handleShowAllProducts}>
            <Text style={styles.buttonText}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttons} onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.buttonText}>Siparişlerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttons,{flexDirection:'row'}]} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Filtrele</Text>
            <MaterialCommunityIcons style={{marginTop:3, marginLeft:3}} name='filter-menu' size={20} color={'gray'}></MaterialCommunityIcons>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.katButtons} onPress={() => setFilteredCategory('meyve')}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Meyve ({meyveCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.katButtons} onPress={() => setFilteredCategory('sebze')}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Sebze ({sebzeCount})</Text>
          </TouchableOpacity>
        </View>
    
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtre Seçenekleri</Text>
            <Picker
              selectedValue={selectedFilter}
              onValueChange={(itemValue) => setSelectedFilter(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Filtre Seçin" value="" />
              <Picker.Item label="Alfabetik" value="alphabetical" />
              <Picker.Item label="Artan Fiyat" value="priceAsc" />
              <Picker.Item label="Azalan Fiyat" value="priceDesc" />
              <Picker.Item label="Şehir" value="city" />
            </Picker>
            {selectedFilter === 'city' && (
              <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => setSelectedCity(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Şehir Seçin" value="" />
                {cities.map(city => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    marginHorizontal: 15,
  },
  buttons: {
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  katButtons: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#de510b',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonText: {
    fontSize: 20,
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
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    padding: 5,
    flex: 0.7,
  },
  productFrom: {
    fontSize: 18,
    paddingLeft: 5,
    paddingBottom: 10,
    color: 'green',
    flex: 0.7,
  },
  productPrice: {
    fontSize: 18,
    flex: 0.3,
    paddingBottom: 10,
  },
  productDet: {
    flexDirection: 'row',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#de510b',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize:18,
    fontWeight: 'bold',
  },
});

export default AllProducts;
