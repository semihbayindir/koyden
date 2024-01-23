import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';

const UreticiScreen = () => {
  const navigation = useNavigation();

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

      <View style={{flexDirection:'row', marginTop:15 }}>
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
      </View>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Profil!</Text>
    </View>
  );
}

function AddProduct() {
  const [isModalVisible, setModalVisible] = useState(true);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [productImage, setProductImage] = useState(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



  const handleImagePick = () => {
    const options = {
      title: 'Select Product Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('Image selection cancelled');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // Set the selected image URI
        setProductImage(response.uri);
      }
    });
  };


  const handleAddProduct = () => {
    // Implement logic to add the product with the entered details
    // For now, you can log the values to the console
    console.log({
      productName,
      productDescription,
      productCategory,
      productQuantity,
      minOrderQuantity,
      unitPrice,
    });

    // Close the modal
    toggleModal();
  };


  return (
    <View style={styles.container}>
      <ImageBackground style={{width:520, height:680,}} source={require('../assets/home/large-set-isolated-vegetables-white-background.png')}>
      <TouchableOpacity onPress={toggleModal}>
      <MaterialCommunityIcons style={{paddingLeft: 360, paddingTop:600}} name='plus-box' color={'#729c44'} size={80} />
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
              <MaterialCommunityIcons style={{marginLeft: 5}} name='file-image-plus-outline' color={'#729c44'} size={80} />
            <Text>Ürün Fotoğrafı Ekleyin</Text>
          </TouchableOpacity>

          {productImage && (
            <Image source={{ uri: productImage }} style={{ width: 100, height: 100 }} />
          )}

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
      </ImageBackground>
    </View>
    
  );
}

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (

    <Tab.Navigator 
      screenOptions={{ headerShown: false, tabBarStyle:{backgroundColor: '#e2eed6',}}}
      
    >
      <Tab.Screen 
        name="Üretici" 
        component={UreticiScreen}
        options={{
          tabBarLabel: 'Ürünler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='food-apple' color={'#729c44'} size={40} />
          ),
          tabBarActiveTintColor: 'green',
        }}
      />
      <Tab.Screen 
        name="AddProduct" 
        component={AddProduct}
        options={{
          tabBarLabel: 'Ürün Ekle',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='plus-circle-outline' color={'#729c44'} size={40} />
          ),
          tabBarActiveTintColor: 'green',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='account' color={'#729c44'} size={45} />
          ),
          tabBarActiveTintColor: 'green',
        }}
      />
    </Tab.Navigator>
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
    margin:15
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
});

export default MyTabs;
