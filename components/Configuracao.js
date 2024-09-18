import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, ToastAndroid, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import LoginComponent from './LoginComponent';
import { getDatabase, ref, set, push, get, child } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Para navegação
import { exportDataToExcel } from './exportToExcel';  // Certifique-se de que está importando corretamente



const Configuracoes = () => {
  const [nomeEvento, setNomeEvento] = useState('');
  const [descricaoBrinde, setDescricaoBrinde] = useState('');
  const [quantidadeBrinde, setQuantidadeBrinde] = useState('');
  const [eventos, setEventos] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(''); // Para adicionar brindes ao evento
  const [eventToDisplay, setEventToDisplay] = useState(''); // Evento para exibir na tela principal
  const [distributionType, setDistributionType] = useState(''); // Tipo de distribuição
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  const db = getDatabase();
  const storage = getStorage();
  const navigation = useNavigation();
  const navigation2 = useNavigation(); // Hook de navegação

  useEffect(() => {
    if (isLoggedIn) {
      const dbRef = ref(db);
      get(child(dbRef, 'eventos')).then((snapshot) => {
        if (snapshot.exists()) {
          const eventosData = snapshot.val();
          const eventosList = Object.keys(eventosData).map(key => ({ id: key, ...eventosData[key] }));
          setEventos(eventosList);
        } else {
          showError("Nenhum evento encontrado.");
        }
      }).catch(() => showError("Erro ao carregar eventos"));
    }
  }, [isLoggedIn]);

  const showError = (message) => {
    ToastAndroid.show(message, ToastAndroid.LONG);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão Negada", "Precisamos de permissão para acessar a biblioteca de mídia.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setError(null);
    } else {
      setError("Nenhuma imagem foi selecionada.");
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const fileName = uri.split('/').pop();
    const imageRef = storageRef(storage, `brindes/${fileName}`);
    const blob = await uriToBlob(uri);
    const snapshot = await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const uriToBlob = async (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Failed to convert URI to Blob'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };
  const handleExport = async () => {
    const success = await exportDataToExcel();
    if (success) {
      ToastAndroid.show("Dados exportados com sucesso", ToastAndroid.LONG);
    } else {
      ToastAndroid.show("Erro ao exportar dados", ToastAndroid.LONG);
    }
  };

  // Função para salvar o evento e tipo de distribuição na AsyncStorage e redirecionar
  const saveSelectedEventForDisplay = async (eventId, type) => {
    try {
      await AsyncStorage.setItem('selectedEventId', eventId);
      await AsyncStorage.setItem('distributionType', type);
      ToastAndroid.show('Evento e tipo de distribuição salvos com sucesso', ToastAndroid.LONG);
      navigation.navigate('SelecionarEvento'); // Redirecionar para a tela principal
    } catch (error) {
      ToastAndroid.show('Erro ao salvar o evento', ToastAndroid.LONG);
    }
  };

  const handleSaveEventForDisplay = () => {
    if (!eventToDisplay || !distributionType) {
      showError("Selecione o evento e o tipo de distribuição.");
      return;
    }
    saveSelectedEventForDisplay(eventToDisplay, distributionType);
  };

  // Função para adicionar novo evento
  const adicionarEvento = () => {
    if (!nomeEvento.trim()) {
      showError("Digite um nome para o evento.");
      return;
    }

    const evento = { title: nomeEvento, name: nomeEvento };
    const eventosRef = ref(db, 'eventos');
    push(eventosRef, evento)
      .then(() => {
        ToastAndroid.show("Evento adicionado com sucesso", ToastAndroid.LONG);
        setNomeEvento('');
      })
      .catch(() => showError("Erro ao adicionar evento"));
  };

  // Função para adicionar brinde ao evento
  const adicionarBrinde = async () => {
    if (!descricaoBrinde.trim() || !quantidadeBrinde.trim() || parseInt(quantidadeBrinde) <= 0 || !image) {
      showError("Preencha todos os campos corretamente.");
      return;
    }

    try {
      const imageUrl = await uploadImageToFirebase(image);
      const brinde = {
        title: descricaoBrinde,
        description: descricaoBrinde,
        amount: parseInt(quantidadeBrinde),
        imageUri: imageUrl,
      };
      const giftsRef = ref(db, `eventos/${selectedEventId}/gifts`);
      push(giftsRef, brinde)
        .then(() => {
          ToastAndroid.show("Brinde adicionado com sucesso ao evento", ToastAndroid.LONG);
          setDescricaoBrinde('');
          setQuantidadeBrinde('');
          setImage(null);
        })
        .catch(() => showError("Erro ao adicionar brinde ao evento"));
    } catch (error) {
      showError("Erro ao adicionar brinde ao evento");
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isLoggedIn ? (
        <LoginComponent onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <View style={styles.divider} />
          <Text style={styles.titulo}>Configurações</Text>
          
          {/* Nova seção para selecionar o evento e o tipo de distribuição para a tela principal */}
          <View style={styles.divider} />
          <Text style={styles.titulo}>Selecionar Evento para Exibir na Tela Principal</Text>

          <Text style={styles.label}>Selecione um Evento</Text>
          <Picker
            selectedValue={eventToDisplay}
            onValueChange={(itemValue) => setEventToDisplay(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Nenhum" value="" />
            {eventos.map(evento => (
              <Picker.Item key={evento.id} label={evento.name} value={evento.id} />
            ))}
          </Picker>

          <Text style={styles.label}>Tipo de Distribuição</Text>
          <View style={styles.distributionContainer}>
            <TouchableOpacity
              style={[styles.distributionButton, distributionType === 'aleatorio' ? styles.selectedDistribution : null]}
              onPress={() => setDistributionType('aleatorio')}
            >
              <Text style={styles.distributionText}>Aleatório</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.distributionButton, distributionType === 'fixo' ? styles.selectedDistribution : null]}
              onPress={() => setDistributionType('fixo')}
            >
              <Text style={styles.distributionText}>Fixo</Text>
            </TouchableOpacity>
          </View>

          <Button color="#4CAF50" title="Salvar Evento e Tipo de Distribuição" onPress={handleSaveEventForDisplay} />

          <View style={styles.divider} />

          <Text style={styles.titulo}>Cadastro de Evento</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do evento"
            value={nomeEvento}
            onChangeText={setNomeEvento}
          />
          <Button color="#4CAF50" title="Adicionar Evento" onPress={adicionarEvento} />

          <View style={styles.divider} />

          <Text style={styles.titulo}>Cadastro de Brinde</Text>

          
          <Text style={styles.label}>Selecione um evento na qual deseja adicionar brindes </Text>

          <Picker
            selectedValue={selectedEventId}
            onValueChange={(itemValue) => setSelectedEventId(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Nenhum" value="" />
            {eventos.map(evento => (
              <Picker.Item key={evento.id} label={evento.name} value={evento.id} />
            ))}
          </Picker>

          <Text style={styles.label}>Nome do Brinde</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do brinde"
            value={descricaoBrinde}
            onChangeText={setDescricaoBrinde}
          />
          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade disponível"
            keyboardType="numeric"
            value={quantidadeBrinde}
            onChangeText={setQuantidadeBrinde}
          />

          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Escolher Imagem</Text>
          </TouchableOpacity>
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          )}

          <Button color="#4CAF50" title="Adicionar Brinde ao Evento" onPress={adicionarBrinde} />
          <View style={styles.divider} />

          {/* Botão para exportar os dados para Excel */}
          <Button
            title="Exportar relatório do banco"
            onPress={handleExport} // Chama a função de exportação
          />
          <View style={styles.divider} />

        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 24,
  },
  distributionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  distributionButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  selectedDistribution: {
    backgroundColor: '#4CAF50',
  },
  distributionText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});

export default Configuracoes;
