import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelecionarEvento from './components/SelecionarEvento';
import Readertype from './components/ReaderType';
import Verificacao from './components/Verificacao';
import ExibicaoBrinde from './components/ExibicaoBrinde';
import Configuracoes from './components/Configuracao';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const StackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SelecionarEvento" 
      component={SelecionarEvento} 
      options={{ title: 'Selecionar Evento' }}
    />
    <Stack.Screen 
      name="Readertype" 
      component={Readertype} 
      options={{ title: 'Tipo de Leitura' }}
    />
    <Stack.Screen 
      name="Verificacao" 
      component={Verificacao} 
      options={{ title: 'Verificação' }}
    />
    <Stack.Screen 
      name="ExibicaoBrinde" 
      component={ExibicaoBrinde} 
      options={{ title: 'Brinde' }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Eventos"
    activeColor="#5C6BC0" 
    barStyle={{ backgroundColor: '#F5F5F5' }} 
  >
    <Tab.Screen 
      name="Eventos" 
      component={StackNavigator}  
      options={{
        tabBarLabel: 'Eventos',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="calendar" color="#3B5998" size={26} />
        ),
      }}
    />
    <Tab.Screen 
      name="Configurações" 
      component={Configuracoes} 
      options={{
        tabBarLabel: 'Configurações',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="cog" color="#3B5998" size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
