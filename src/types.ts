import { GraphQLRequest } from 'apollo-link';
import { DocumentNode } from 'graphql';

export enum RequestType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}

export interface IMutationRequest extends GraphQLRequest {
  mutation: DocumentNode;
}
