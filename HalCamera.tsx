import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

export default function HalCamera() {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  if (!permission) {
    return <View><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCoords(location.coords);
    return location.coords;
  };

  const openCamera = async () => {
    const location = await getLocation(); // Ambil lokasi dulu

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await savePhoto(uri, location); // Simpan lokasi bersama foto
    }
  };

  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const savePhoto = async (uri: string, location?: { latitude: number; longitude: number }) => {
    try {
      const fileName = uri.split('/').pop();
      const newUri = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      const locationInfo = location
        ? `Latitude: ${location.latitude}, Longitude: ${location.longitude}\n`
        : 'Location not available\n';

      const logFileUri = FileSystem.documentDirectory + 'photoWithLocation.txt';
      await FileSystem.writeAsStringAsync(logFileUri, `Photo: ${fileName}\n${locationInfo}`, {
        encoding: FileSystem.EncodingType.UTF8,
        append: true,
      });

      console.log('Photo saved to', newUri);
      console.log('Location saved to log file');
    } catch (error) {
      console.error('Error saving photo/location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.actionContainer}>
        <Button title="Open Camera" onPress={openCamera} />
        <Button title="Open Gallery" onPress={openGallery} />
        <Button title="Save Last Photo" onPress={() => savePhoto(photoUri!)} disabled={!photoUri} />
      </View>

      {photoUri && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>Photo Preview:</Text>
          <Image source={{ uri: photoUri }} style={styles.image} />
        </View>
      )}

      {coords && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: 'white' }}>Latitude: {coords.latitude}</Text>
          <Text style={{ color: 'white' }}>Longitude: {coords.longitude}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
  },
  imageText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
