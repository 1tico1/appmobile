import React, { useEffect, useState, useCallback } from 'react';
import { Button, View, Text, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { database } from './firebaseConfig';
import { ref, get } from 'firebase/database';
import { StyleSheet } from 'react-native';

const SelecionarEvento = ({ navigation }) => {
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [distributionType, setDistributionType] = useState('');
  const [loading, setLoading] = useState(true);

  // Função para buscar o evento selecionado e o tipo de distribuição
  const fetchSelectedEvent = async () => {
    try {
      const eventId = await AsyncStorage.getItem('selectedEventId');
      const distType = await AsyncStorage.getItem('distributionType');
      if (eventId && distType) {
        const snapshot = await get(ref(database, `eventos/${eventId}`));
        if (snapshot.exists()) {
          setEventoSelecionado({ id: eventId, ...snapshot.val() });
          setDistributionType(distType);
        } else {
          ToastAndroid.show("Evento não encontrado", ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show("Nenhum evento foi selecionado", ToastAndroid.LONG);
      }
      setLoading(false);
    } catch (error) {
      ToastAndroid.show("Erro ao carregar evento", ToastAndroid.LONG);
      setLoading(false);
    }
  };

  // UseFocusEffect será chamado sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchSelectedEvent(); // Atualiza os dados toda vez que a tela é focada
    }, [])
  );

  const handleEventPress = () => {
    if (eventoSelecionado) {
      Alert.alert(
        "Seleção de Brinde",
        `Distribuição: ${distributionType === 'aleatorio' ? 'Aleatória' : 'Fixa'}`,
        [
          {
            text: "Confirmar",
            onPress: () => navigation.navigate('Verificacao', { 
              eventoId: eventoSelecionado.id, 
              eventoName: eventoSelecionado.name, 
              aleatorio: distributionType === 'aleatorio' 
            }),
          },
          {
            text: "Cancelar",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } else {
      ToastAndroid.show("Nenhum evento selecionado", ToastAndroid.LONG);
    }
  };

  if (loading) {
    return <View style={styles.container}><Text>Carregando evento...</Text></View>;
  }

  if (!eventoSelecionado) {
    return <View style={styles.container}><Text>Nenhum evento disponível</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.eventItem}>
        <Button 
          title={eventoSelecionado.name || "Evento Sem Nome"}
          onPress={handleEventPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16
  },
  eventItem: {
    marginBottom: 16, 
  }
});

export default SelecionarEvento;
