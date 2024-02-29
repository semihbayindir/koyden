import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Loading from './loadings/Loading';

  const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  })

  return (
<>
    {loading ? (

        <View style={{alignContent:'center',marginTop:200}}><Loading/></View>
      ) : (
        <>
    <View style={styles.container}>
      <Pressable style={styles.cardWhite}
      onPress={() => navigation.navigate("Uretici")}
      >
        <Text style={styles.roleTitle}>ÜRETİCİ</Text>
        <Image style={styles.roleImage} source={require("../assets/home/large-set-isolated-vegetables-white-background.png")} />
      </Pressable>

      <Pressable style={styles.cardGreen}
      onPress={() => navigation.navigate("Tuketici")}
      >
        <Text style={styles.roleTitle}>TÜKETİCİ</Text>
        <Image style={styles.roleImage}  source={require("../assets/home/174209-basket-fresh-fruit-free-photo.png")} />
      </Pressable>

      <Pressable style={styles.cardGray}
      onPress={() => navigation.navigate("Tasiyici")}
      >
        <Text style={styles.roleTitle}>TAŞIYICI</Text>
        <Image style={styles.roleImage} source={require("../assets/home/Trucking-Background-PNG.png")} />
      </Pressable>
    </View>
    </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#f9fbe5',
    flex:1
  },
  roleTitle: {
    paddingLeft:20,
    fontSize: 24,
    fontWeight: '800',
    zIndex:1
  },
  cardWhite: {
    backgroundColor: '#fff',
    marginBottom: '3%',
    marginLeft: '5%',
    marginTop:7,
    width: '90%',
    height: '31%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
    overflow: 'hidden'
  },
  cardGreen: {
    backgroundColor: '#cde8b5',
    marginBottom: '3%',
    marginLeft: '5%',
    height: '31%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 5,
    overflow: 'hidden',
    
  },
  cardGray: {
    backgroundColor: '#d6d7cf',
    marginLeft: '5%',
    width: '90%',
    marginBottom: '3%',
    shadowColor: '#000',
    height: '31%',
    borderRadius: 30,
    padding: 10,
    overflow: 'hidden',
  },
  roleImage: {
    width: '90%',
    height: undefined,
    aspectRatio: 16/9,
    resizeMode: 'cover',
    overflow: 'visible',
    marginLeft:15
  },
});

export default HomeScreen;

