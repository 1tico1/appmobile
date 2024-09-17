import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const LoginComponent = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    const mockUsuarios = [{ id: 1, usuario: 'Admin', senha: '1234' }];
    const user = mockUsuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (user) {
      onLoginSuccess();
      setUsuario('');
      setSenha('');
    } else {
      Alert.alert('Erro', 'Usuário ou senha inválidos');
    }
  };

  return (
    <View>
      <Text style={{ fontSize: 24, textAlign: "center" }}>Faça Login</Text>
      <TextInput
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          marginVertical: 10,
          padding: 10,
        }}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          marginVertical: 10,
          padding: 10,
        }}
      />
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "lime",
          marginVertical: 10,
          padding: 10,
          fontSize: 18,
          textAlign: "center",
          borderRadius: 10,
        }}
      >
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginComponent;
