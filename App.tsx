// App.tsx
import React from 'react';
import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import client from './ApolloClient';

// GraphQL dotaz podle schématu z RaqetIS
const GET_EXPERTS = gql`
    query GetExperts {
        experts {
            expertID
            firstName
            lastName
            personalID
            birthDate
            addressID
            contactID
            email
            specialization
            marketHourlyRate
            marketDailyRate
            educationLevel
            seniorityLevelID
            createdAt
        }
    }
`;

// TypeScript typy
interface Expert {
    expertID: number;
    firstName: string;
    lastName: string;
    personalID?: string | null;
    birthDate?: string | null;
    addressID?: number | null;
    contactID?: number | null;
    email: string;
    specialization?: string | null;
    marketHourlyRate: number;
    marketDailyRate: number;
    educationLevel?: string | null;
    seniorityLevelID: number;
    createdAt: string;
}

interface ExpertsData {
    experts: Expert[];
}

const ExpertsList: React.FC = () => {
    const { loading, error, data } = useQuery<ExpertsData>(GET_EXPERTS);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text style={styles.error}>Chyba: {error.message}</Text>;

    return (
        <FlatList
            data={data?.experts}
            keyExtractor={(item) => item.expertID.toString()}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.detail}>ID: {item.expertID}</Text>
                    <Text style={styles.detail}>Osobní ID: {item.personalID || 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Datum narození: {item.birthDate || 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Adresa ID: {item.addressID ?? 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Kontakt ID: {item.contactID ?? 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Email: {item.email}</Text>
                    <Text style={styles.detail}>Specializace: {item.specialization || 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Hodinová sazba: {item.marketHourlyRate} Kč</Text>
                    <Text style={styles.detail}>Denní sazba: {item.marketDailyRate} Kč</Text>
                    <Text style={styles.detail}>Vzdělání: {item.educationLevel || 'Neuvedeno'}</Text>
                    <Text style={styles.detail}>Seniority level ID: {item.seniorityLevelID}</Text>
                    <Text style={styles.detail}>Vytvořeno: {item.createdAt}</Text>
                </View>
            )}
        />
    );
};

export default function App() {
    return (
        <ApolloProvider client={client}>
            <View style={styles.container}>
                <Text style={styles.title}>Seznam expertů</Text>
                <ExpertsList />
            </View>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
                                     container: {
                                         flex: 1,
                                         paddingTop: 50,
                                         paddingHorizontal: 15,
                                     },
                                     title: {
                                         fontSize: 24,
                                         fontWeight: 'bold',
                                         marginBottom: 20,
                                         textAlign: 'center',
                                     },
                                     item: {
                                         marginBottom: 15,
                                         padding: 15,
                                         borderRadius: 8,
                                         backgroundColor: '#eef2ff',
                                         shadowColor: '#000',
                                         shadowOffset: { width: 0, height: 2 },
                                         shadowOpacity: 0.1,
                                         shadowRadius: 5,
                                         elevation: 3,
                                     },
                                     name: {
                                         fontSize: 18,
                                         fontWeight: 'bold',
                                         marginBottom: 8,
                                     },
                                     detail: {
                                         fontSize: 14,
                                         color: '#333',
                                         marginBottom: 4,
                                     },
                                     error: {
                                         color: 'red',
                                         textAlign: 'center',
                                     },
                                 });