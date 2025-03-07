// ApolloClient.ts
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { fetch as sslPinnedFetch, ReactNativeSSLPinning } from 'react-native-ssl-pinning';

// Logger middleware (loguje requesty i response)
const loggerLink = new ApolloLink((operation, forward) => {
    console.log(`[GraphQL Request]: ${operation.operationName}`, operation.variables);

    return forward(operation).map((response) => {
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

// fetch s SSL pinningem (správně přetypované)
const fetchWithSSLPinning = (uri: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    const uriString = uri.toString();
    return sslPinnedFetch(uriString, {
        method: options?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | undefined,
        body: options?.body as string,
        headers: options?.headers as Record<string, string>,
        sslPinning: {
            certs: ['keystore.p12'], // certifikát 'cert.cer' v Resources (iOS) nebo assets (Android)
        },
        timeoutInterval: 10000,
    }).then((response: ReactNativeSSLPinning.Response) => {
        return new Response(response.bodyString, {
            status: response.status,
            headers: response.headers,
        });
    });
};

// HTTP link s SSL pinningem
const httpLink = new HttpLink({
                                  uri: 'https://192.168.77.151:8443/graphql',
                                  fetch: fetchWithSSLPinning,
                              });

// Apollo Client s middleware
const client = new ApolloClient({
                                    link: ApolloLink.from([loggerLink, errorLink, httpLink]),
                                    cache: new InMemoryCache(),
                                });

export default client;
