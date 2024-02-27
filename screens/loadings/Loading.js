import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

const Loading = () => {
  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        style={{
          width: 400,
          height: 400,
        }}
        source={require('../../assets/loading/Animation - 1706197142779.json')}
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

export default Loading;
