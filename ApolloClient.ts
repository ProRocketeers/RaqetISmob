import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { fetch as sslPinnedFetch } from 'react-native-ssl-pinning';
import { NetworkInfo } from "react-native-network-info";

// Funkce pro získání backendové IP adresy
async function getBackendIP(): Promise<string> {
    const ip = await NetworkInfo.getGatewayIPAddress();
    console.log(`🔍 Detekovaná IP adresa backendu: ${ip}`);
    return ip || "192.168.77.151"; // Záloha na pevnou IP
}

// Funkce pro vytvoření Apollo klienta
async function createApolloClient() {
    const backendIP = await getBackendIP();

    // SSL Pinning fetch kompatibilní s Apollo
    const fetchWithSSLPinning = (uri: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
        return sslPinnedFetch(uri.toString(), {
            method: options?.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
            body: options?.body as string,
            headers: options?.headers as Record<string, string>,
            sslPinning: {
                certs: ['keystore'], // bez přípony ".cer"
            },
            timeoutInterval: 10000,
        }).then((response: any) => {
            return new Response(response.bodyString, {
                status: response.status,
                headers: response.headers,
            });
        });
    };

    // HTTP link s SSL pinningem
    const httpLink = new HttpLink({
                                      uri: `https://${backendIP}:8443/graphql`,
                                      fetch: fetchWithSSLPinning,
                                  });

    // Logger middleware – loguje requesty i response
    const loggerLink = new ApolloLink((operation, forward) => {
        console.log(`[GraphQL Request]: ${operation.operationName}`, operation.variables);
        return forward(operation).map(response => {
            console.log(`[GraphQL Response]: ${operation.operationName}`, response);
            return response;
        });
    });

    // Middleware pro zachycení a logování chyb
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) =>
                                      console.error(`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
            );
        }
        if (networkError) {
            console.error(`[Network Error]: ${networkError}`);
        }
    });

    // Vytvoření Apollo klienta
    return new ApolloClient({
                                link: ApolloLink.from([loggerLink, errorLink, httpLink]),
                                cache: new InMemoryCache(),
                            });
}

// Exportujeme promise, který bude vracet Apollo klienta
export default createApolloClient;
