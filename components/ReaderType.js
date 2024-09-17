import React from 'react';
import { Button, StyleSheet, View, Text } from 'react-native';

const Readertype = ({ route, navigation }) => {
  const { eventoId, aleatorio, eventoName } = route.params; // Recebe o nome do evento

  const handleManualCode = () => {
    navigation.navigate('Verificacao', { eventoId, type: 'manual', aleatorio });
  };

  return (
    <View style={styles.container}>
      {/* Exibe o nome do evento */}
      <Text style={styles.eventTitle}>Evento: {eventoName}</Text>

      <View style={styles.eventItem}>
        <Button title="Código Manual" onPress={handleManualCode} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventItem: {
    marginBottom: 16,
    width: '80%',
  },
});

export default Readertype;
