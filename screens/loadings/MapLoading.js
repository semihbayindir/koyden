import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

const MapLoading = () => {
  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        style={{
          width: 350,
          height: 350,
        }}
        source={require('../../assets/loading/Animation - 1709036862512.json')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapLoading;
