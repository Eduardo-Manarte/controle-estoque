import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

import EstoqueScreen from './src/screens/EstoqueScreen';
import EntradaScreen from './src/screens/EntradaScreen';
import SaidaScreen from './src/screens/SaidaScreen';

const tempStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Estoque') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Entrada') {
              iconName = focused ? 'arrow-down-circle' : 'arrow-down-circle-outline';
            } else if (route.name === 'Saída') {
              iconName = focused ? 'arrow-up-circle' : 'arrow-up-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Estoque" component={EstoqueScreen} />
        <Tab.Screen name="Entrada" component={EntradaScreen} />
        <Tab.Screen name="Saída" component={SaidaScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
