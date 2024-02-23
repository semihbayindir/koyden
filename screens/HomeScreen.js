import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Loading from './Loading';

  const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  })

  return (
    <ScrollView style={{backgroundColor:'#f9fbe5'}}>
      {loading ? (
        <Loading/>
      ) : (
        <>
    <View style={{backgroundColor:'#f9fbe5'}}>
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

      <TouchableOpacity style={styles.cardGray}>
        <Text style={styles.roleTitle}>TAŞIYICI</Text>
        <Image style={styles.roleImage} source={require("../assets/home/Trucking-Background-PNG.png")} />
      </TouchableOpacity>
    </View>
    </View>
    </>
      )}
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  roleTitle: {
    paddingLeft:20,
    fontSize: 24,
    fontWeight: '800',
    zIndex:1
  },
  cardWhite: {
    backgroundColor: '#fff',
    marginBottom: 15,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
    overflow: 'hidden'
  },
  cardGreen: {
    backgroundColor: '#cde8b5',
    marginBottom: 15,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
    overflow: 'hidden'
  },
  cardGray: {
    backgroundColor: '#d6d7cf',
    marginBottom: 15,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
    overflow: 'hidden',
  },
  roleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    overflow: 'visible'
  },
});

export default HomeScreen;
