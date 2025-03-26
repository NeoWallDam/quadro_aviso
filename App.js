import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native';

import Home from './src/pages/Home';
import LEPA from './src/pages/LEPA';
import Painel from './src/pages/Painel';

const Stack = createNativeStackNavigator();

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="LEPA" component={LEPA} />
        <Stack.Screen name="Painel" component={Painel} />
      </Stack.Navigator>
    </NavigationContainer>
  )
 }