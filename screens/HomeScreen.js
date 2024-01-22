import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';

const HomeScreen = () => {
  return (
    <View style={{backgroundColor:'#f9fbe5'}}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.cardWhite}>
        <Text style={styles.roleTitle}>ÜRETİCİ</Text>
        <Image style={styles.roleImage} source={require("/Users/semihbayindir/koyden/assets/UreticiRolu.jpeg")} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardGreen}>
        <Text style={styles.roleTitle}>TÜKETİCİ</Text>
        <Image style={styles.roleImage}  source={require("/Users/semihbayindir/koyden/assets/TuketiciRolu.png")} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardGray}>
        <Text style={styles.roleTitle}>TAŞIYICI</Text>
        <Image style={styles.roleImage} source={require("/Users/semihbayindir/koyden/assets/UreticiRolu.jpeg")} />
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  roleTitle: {
    paddingLeft:20,
    fontSize: 24,
    fontWeight: '800'
  },
  cardWhite: {
    backgroundColor: '#fff',
    marginBottom: 20,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
  },
  cardGreen: {
    backgroundColor: '#cde8b5',
    marginBottom: 20,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
  },
  cardGray: {
    backgroundColor: '#d6d7cf',
    marginBottom: 10,
    marginLeft: '5%',
    width: '90%',
    shadowColor: '#000',
    borderRadius: 30,
    padding: 10,
  },
  roleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});

export default HomeScreen;
