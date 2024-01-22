import { View, StyleSheet, Text, Button, Pressable, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'

const HomeScreen = () => {
  return (

    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={{flex:1}}>
      <View >
      <TouchableOpacity style={styles.containPro}>
      <Text style={{fontFamily: 'DamascusBold', fontSize: 24, paddingTop:5, paddingStart:15}}> ÜRETİCİ</Text>
        <Image 
        style={styles.imagesty}
        source={require('../assets/home/large-set-isolated-vegetables-white-background.png')}>
        </Image>
      </TouchableOpacity>
      </View>


      <View >
     
      <TouchableOpacity style={styles.containCon}>
      <Text style={{fontFamily: 'DamascusBold', fontSize: 24, paddingTop:5, paddingStart:15}}> TÜKETİCİ</Text>
        <Image 
        style={styles.imagesty}
        source={require('../assets/home/174209-basket-fresh-fruit-free-photo.png')}>
        </Image>
      </TouchableOpacity>
      </View>


      <View >
      <TouchableOpacity style={styles.containTra}>
      <Text style={{fontFamily: 'DamascusBold', fontSize: 24, paddingTop:5, paddingStart:15}}> TAŞIYICI</Text>
        <Image 
        style={styles.imageTra}
        source={require('../assets/home/Trucking-Background-PNG.png')}>
        </Image>
      </TouchableOpacity>
      </View>

      
    </View>
    </ScrollView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  imagesty: {
    alignSelf:'center',
    height:190,
    resizeMode: 'contain',
    
  },
  imageTra: {
    alignSelf:'center',
    height:155,
    resizeMode:'contain',
  },
  containCon :{
    borderWidth:3,
    borderColor: '#b7ba91',
    borderRadius : 15,
    backgroundColor:'#e0e3b3',
    marginHorizontal:15,
    justifyContent:'center',
    marginBottom:10,
  },
  containPro :{
    borderWidth:3,
    borderColor: '#bcbdb5',
    borderRadius : 15,
    backgroundColor:'white',
    marginHorizontal:15,
    justifyContent:'center',
    marginBottom:10,
    marginTop:10,
  },
  containTra :{
    borderWidth:3,
    borderColor: '#a0a197',
    borderRadius : 15,
    backgroundColor:'#bebfb4',
    marginHorizontal:15,
    justifyContent:'center'
  }
})