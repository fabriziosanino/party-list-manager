import React from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#7c3aed" />
      <HomeScreen />
    </>
  );
}