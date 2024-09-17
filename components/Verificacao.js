import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Button, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get, update, push } from "firebase/database";

// Função para calcular a Distância de Levenshtein
const levenshteinDistance = (a, b) => {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array(bn + 1).fill(null).map(() => Array(an + 1).fill(null));
  for (let i = 0; i <= an; i += 1) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= bn; j += 1) {
    matrix[j][0] = j;
  }
  for (let j = 1; j <= bn; j += 1) {
    for (let i = 1; i <= an; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return matrix[bn][an];
};

const Verificacao = ({ route, navigation }) => {
  const { eventoId, aleatorio } = route.params;
  const [codigo, setCodigo] = useState('');
  const inputRef = useRef(null);
  const database = getDatabase();

  useEffect(() => {
    const clearAndFocus = async () => {
      const clearCode = await AsyncStorage.getItem('clearCode');
      if (clearCode === 'true') {
        setCodigo('');
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
        await AsyncStorage.removeItem('clearCode');
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      clearAndFocus();
    });

    return unsubscribe;
  }, [navigation]);

  const sanitizeCode = (codigo) => {
    return codigo.replace(/\s+/g, '').toLowerCase();
  };

  // Função para verificar o brinde
  const verificarBrinde = (codigoLimpo) => {
    const giftsRef = ref(database, `eventos/${eventoId}/gifts`);

    get(giftsRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          const brindes = snapshot.val();
          let brindeSelecionado = null;

          const brindesArray = Object.keys(brindes).map(key => ({
            id: key,
            ...brindes[key],
          }));

          if (aleatorio) {
            brindeSelecionado = brindesArray[Math.floor(Math.random() * brindesArray.length)];
          } else {
            brindeSelecionado = brindesArray[0];
          }

          if (brindeSelecionado && brindeSelecionado.amount > 0) {
            alert(`Você ganhou: ${brindeSelecionado.description}`);

            const novaQuantidade = brindeSelecionado.amount - 1;
            const brindeId = brindeSelecionado.id;

            const brindeRef = ref(database, `eventos/${eventoId}/gifts/${brindeId}`);

            update(brindeRef, { amount: novaQuantidade })
              .then(() => {
                const codigosRef = ref(database, `eventos/${eventoId}/codigosUtilizados`);

                push(codigosRef, {
                  codigo: codigoLimpo,
                  dataHora: new Date().toLocaleString(),
                });
                navigation.navigate('ExibicaoBrinde', { eventoId, brinde: brindeSelecionado });
              })
              .catch((error) => {
                console.error("Erro ao salvar o código utilizado:", error);
              });
          } else {
            alert("Brinde indisponível ou esgotado.");
          }
        } else {
          alert("Nenhum brinde encontrado.");
        }
      })
      .catch(error => {
        console.error("Erro ao buscar brindes:", error);
      });
  };

  // Verificação com tolerância de similaridade
  const verificarCodigo = (codigo) => {
    const codigoLimpo = sanitizeCode(codigo);
  
    const codigosRef = ref(database, `eventos/${eventoId}/codigosUtilizados`);
  
    get(codigosRef)
      .then(snapshot => {
        let codigosUtilizados = snapshot.val();
  
        if (codigosUtilizados) {
          // Extrai o campo 'codigo' de cada objeto e sanitiza para comparação
          const listaCodigos = Object.values(codigosUtilizados).map(item => sanitizeCode(item.codigo));
          const distanciaMaxima = 3; // Define o limite de diferença aceitável
  
          for (let codigoSalvo of listaCodigos) {
            const distancia = levenshteinDistance(codigoLimpo, codigoSalvo);
            if (distancia <= distanciaMaxima) {
              // Se o código já foi utilizado, exibe um alerta e redireciona usando a função `redirectToVerificacao`
              Alert.alert(
                "Código já utilizado",
                "Este código já foi utilizado.",
                [
                  {
                    text: "OK",
                    onPress: () => redirectToVerificacao(), // Chama a função para redirecionar
                  },
                ]
              );
              return;
            }
          }
  
          // Se não encontrou um código suficientemente parecido
          verificarBrinde(codigoLimpo);
        } else {
          verificarBrinde(codigoLimpo);
        }
      })
      .catch(error => {
        alert("Erro ao verificar o código.");
        console.error("Erro ao verificar o código:", error);
      });
  };
  
  // Função para redirecionar para a tela de Verificação
  const redirectToVerificacao = async () => {
    try {
      await AsyncStorage.setItem('clearCode', 'true'); // Sinaliza que o campo de código precisa ser limpo
  
      // Agora faz o redirecionamento e substitui a tela atual
      navigation.replace('Verificacao', { eventoId, aleatorio: true });
    } catch (error) {
      ToastAndroid.show('Erro ao redirecionar para Verificação', ToastAndroid.LONG);
    }
  };
  
  const handleManualCodigo = () => {
    if (codigo.trim() === '') {
      alert('Por favor, digite um código.');
      return;
    }
    verificarCodigo(codigo);
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>Digite o Código</Text>
      <TextInput
        ref={inputRef}
        autoFocus
        placeholder="Digite o código"
        value={codigo}
        onChangeText={setCodigo}
        style={styles.textInput}
      />
      <Button title="Verificar Entrega" onPress={handleManualCodigo} />
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
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 20,
    padding: 10,
    fontSize: 18,
    borderRadius: 4,
    textAlign: 'center',
    width: '80%',
  },
});

export default Verificacao;
