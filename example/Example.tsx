import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import VerticalDeckCarousel from 'react-native-vertical-deck-carousel';

const data = [
  { id: '1', title: 'Credit Card', amount: '₹1,50,000', color: '#292929' },
  { id: '2', title: 'Personal Loan', amount: '₹5,00,000', color: '#183C70' },
  { id: '3', title: 'Investment', amount: '₹2,50,000', color: '#245D45' },
];

export default function Example() {
  return (
    <VerticalDeckCarousel
      data={data}
      keyExtractor={item => item.id}
      cardHeight={190}
      cardOffset={22}
      visibleCards={3}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: item.color }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 22, justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  amount: { color: '#fff', fontSize: 30, fontWeight: '800' },
});
