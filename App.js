import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import HalCamera from './HalCamera';  // Pastikan HalCamera ada di direktori yang benar

export default function App() {
  const [coords, setCoords] = useState(null);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCoords(location.coords);
    console.log(location);

    const locationData = `Longitude: ${location.coords.longitude}, Latitude: ${location.coords.latitude}\n`;

    const fileUri = FileSystem.documentDirectory + 'locationData.txt';

    try {
      await FileSystem.writeAsStringAsync(fileUri, locationData, {
        encoding: FileSystem.EncodingType.UTF8,
        append: true,
      });
      console.log('Location data saved!');
    } catch (error) {
      console.error('Error saving location data: ', error);
    }
  };

  const openFile = async () => {
    const fileUri = FileSystem.documentDirectory + 'locationData.txt';
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log('Sharing is not available on this platform');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Muhammad Sidqi Gufron - 00000083435</Text>

      {/* HalCamera Component */}
      <HalCamera />

      <Button title="Get Location" onPress={getLocation} />
      
      {coords && (
        <View style={{ marginTop: 10 }}>
          <Text>Longitude: {coords.longitude}</Text>
          <Text>Latitude: {coords.latitude}</Text>
        </View>
      )}

      <Button title="Save Location to File" onPress={getLocation} />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
