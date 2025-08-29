import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PartiesOverviewScreen from './src/screens/PartiesOverviewScreen';
import { Party } from './src/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'overview' | 'party'>('overview');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  const handleSelectParty = (party: Party) => {
    setSelectedParty(party);
    setCurrentScreen('party');
  };

  const handleBackToParties = () => {
    setCurrentScreen('overview');
    setSelectedParty(null);
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#7c3aed" />
      {currentScreen === 'overview' ? (
        <PartiesOverviewScreen onSelectParty={handleSelectParty} />
      ) : (
        selectedParty && (
          <HomeScreen 
            party={selectedParty} 
            onBackToParties={handleBackToParties} 
          />
        )
      )}
    </>
  );
}