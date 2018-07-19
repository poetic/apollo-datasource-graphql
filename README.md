# apollo-datasource-graphql

Connect your GraphQL server to an existing GraphQL API using DataSources.

**Note: This requires [Apollo Server 2.0](https://www.apollographql.com/docs/apollo-server/whats-new.html)**

## GraphQL Data Source

```
yarn add apollo-datasource-graphql
```

or 

```
npm i apollo-datasource-graphql --save
```

### 

Define a data source by extending the `GraphqlDataSource` class. You can then implement the queries and mutatons that your resolvers require.

```javascript
import { GraphQLDataSource } from 'apollo-datasource-graphql';
import { gql } from 'apollo-server-express';

const CRAFT_BEERS = gql`
  query {
    craftBeers {
      name
      style
      abv
      brewery {
        name
      }
    }
  }
`;

export class CraftBeerGraphQLApi extends GraphQLDataSource {
  public baseURL = 'https//craft-beer-api.example/graphql';

  public async getCraftBeers() {
    try {
      const response = await this.query(CRAFT_BEERS);
      
      return response.data.craftBeers;
    } catch (error) {
      console.error(error);
    }
  }
}
```

## GraphQL Operations

The `query` method on the `GraphQLDataSource` makes a request to the GraphQL server. `query` accepts a second parameter, `variables`, which can be used to pass any required or option params with the query request.

```javascript
public async searchCraftBeerByName(name) {
  try {
    const response = await this.query(CRAFT_BEERS, {
      name,
    });
    
    return response.data.craftBeer;
  } catch (error) {
    console.error(error);
  }
}
```

## Intercepting Operations

You can intersept the request to set headers on an outgoing request. This is most commonly used for authentication. Since Apollo Data Sources have access to GraphQL context, you can store a user token or other information you need to have available when making a request.

Add the method `willSendRequest` to your class which will recieve the `request` object. Here, you can modify the request to meet your needs.

```javascript
  protected willSendRequest(request: any) {
    const { accessToken } = this.context;

    set(request, 'headers.authorization', accessToken);
  }
```

## TODO

- [ ] Complete README
- [ ] Mutation method
- [ ] Test Suite
- [ ] Request caching
