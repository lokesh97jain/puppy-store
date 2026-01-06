import { Stack } from 'expo-router';
import React from 'react';
import PuppyListScreen from '../src/screens/PuppyListScreen';

export default function Home() {
return (
<>
<Stack.Screen options={{ headerShown: true, title: "Puppy Store", }} /> 
<PuppyListScreen />
</>
);
}

