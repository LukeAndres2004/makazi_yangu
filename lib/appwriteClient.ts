import { Client } from 'react-native-appwrite';

const client = new Client()
    .setProject("69a15b57001cded6a93d")
    .setEndpoint("https://fra.cloud.appwrite.io/v1");

export default client;