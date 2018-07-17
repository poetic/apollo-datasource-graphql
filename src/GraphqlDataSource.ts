import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-fetch';
import { set } from 'lodash';

export class GraphqlDataSource {
  public baseURL?: string;
  private client: any;

  constructor() {
    this.configureApolloClient();
  }

  public async mutate(mutation: any, variables?: any) {
    return this.client.mutate({ mutation, variables });
  }

  public async query(query: any, variables?: any) {
    return this.client.query({ query, variables });
  }

  protected willSendRequest?(request: any): any;

  private configureApolloClient() {
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        this.onErrorLink(),
        this.onRequestLink(),
        this.resolveUri(),
        new HttpLink({
          fetch,
          uri: this.baseURL,
        }),
      ]),
    });
  }

  private resolveUri() {
    return setContext((_, request) => {
      set(request, 'uri', this.baseURL);

      return request;
    });
  }

  private onRequestLink() {
    return setContext((_, request) => {
      if (this.willSendRequest) {
        this.willSendRequest(request);
      }

      return request;
    });
  }

  private onErrorLink() {
    return onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );

      }

      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    });
  }
}
