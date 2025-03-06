// ApolloClient.ts
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';

// Logovací middleware pro Apollo Client (loguje requesty i response)
const loggerLink = new ApolloLink((operation, forward) => {
    console.log(`[GraphQL Request]`, operation.operationName, operation.variables);

    return forward(operation).map((response) => {
        console.log(`[GraphQL Response]`, response);
        return response;
    });
});

// Middleware pro zachycení chyb v GraphQL dotazech
const errorLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
        if (response.errors) {
            console.error('[GraphQL Error]', response.errors);
        }
        return response;
    });
});

const httpLink = new HttpLink({ uri: 'https://192.168.77.151:8443/graphql' });

// Apollo klient s logováním a zachytáváním chyb
const client = new ApolloClient({
                                    link: ApolloLink.from([loggerLink, errorLink, httpLink]),
                                    cache: new InMemoryCache(),
                                });

export default client;
