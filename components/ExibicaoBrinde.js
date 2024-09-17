import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Button, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExibicaoBrinde = ({ route, navigation }) => {
  const { brinde, eventoId } = route.params;
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    console.log('Imagem carregada com sucesso:', brinde.imageUri);
  };

  const handleImageError = (error) => {
    setIsLoading(false);
    setImageError(true);
    console.warn("Erro ao carregar imagem:", brinde.imageUri, error.nativeEvent.error);
  };

  // Função para redirecionar para a tela de verificação com recarregamento
  const redirectToVerificacao = async () => {
    try {
      await AsyncStorage.setItem('clearCode', 'true'); // Sinaliza que o campo de código precisa ser limpo
      ToastAndroid.show('Redirecionando para Verificação', ToastAndroid.LONG);
      navigation.navigate('Verificacao', { eventoId, aleatorio: true }); // Redireciona para a tela de verificação
    } catch (error) {
      ToastAndroid.show('Erro ao redirecionar para Verificação', ToastAndroid.LONG);
    }
  };
 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brinde.title}</Text>

      {isLoading && !imageError && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      {brinde.imageUri && !imageError ? (
        <Image
          source={{ uri: brinde.imageUri }}
          style={styles.image}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        imageError && <Text>Imagem não disponível.</Text>
      )}

      <Text style={styles.description}>{brinde.description}</Text>
      <Text style={styles.amount}>Quantidade disponível: {brinde.amount}</Text>

      {/* Botão para redirecionar para Verificação */}
      <Button title="Voltar para Verificação" onPress={redirectToVerificacao} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 8,
  },
  amount: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 4,
  },
});

export default ExibicaoBrinde;
