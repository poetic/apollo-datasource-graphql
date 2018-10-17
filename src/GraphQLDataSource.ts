import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ApolloLink, execute, GraphQLRequest, makePromise } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server-errors';
import { DocumentNode } from 'graphql';

type ValueOrPromise<T> = T | Promise<T>;
type RequestOptions = Record<string, any>;

export class GraphQLDataSource<TContext = any> extends DataSource {
  public context!: TContext;
  public link!: ApolloLink;

  initialize(config: DataSourceConfig<TContext>): void {
    this.context = config.context;
    this.link = ApolloLink.from([
      this.onRequestLink(),
      this.link
    ]);
  }

  public async mutation(mutation: DocumentNode, options: GraphQLRequest) {
    // GraphQL request requires the DocumentNode property to be named query
    return this.execute({ ...options, query: mutation });
  }

  public async query(query: DocumentNode, options: GraphQLRequest) {
    return this.execute({ ...options, query });
  }

  protected willSendRequest?(request: RequestOptions): ValueOrPromise<void>;

  private async execute(operation: GraphQLRequest) {
    try {
      return await makePromise(execute(this.link, operation));
    } catch (error) {
      const status = error.statusCode ? error.statusCode : null;
      const message = error.bodyText ? error.bodyText : null;

      let apolloError: ApolloError;

      switch (status) {
        case 401:
          apolloError = new AuthenticationError(message);
          break;
        case 403:
          apolloError = new ForbiddenError(message);
          break;
        default:
          apolloError = new ApolloError(message);
      }

      throw apolloError;
    }
  }

  private onRequestLink() {
    // QUESTION: Is that first argument needed? Code for apollo mentions it's actually `request, prevContext`
    return setContext(async (_, request: RequestOptions) => {
      if (this.willSendRequest) {
        await this.willSendRequest(request);
      }

      return request;
    });
  }
}
