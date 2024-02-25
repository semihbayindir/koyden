import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const SearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ürün Ara..."
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 12,
    marginVertical: 10,
    marginTop:15
  },
  input: {
    fontSize: 16,
  },
});

export default SearchBar;
