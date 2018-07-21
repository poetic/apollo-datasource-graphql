# apollo-datasource-graphql

Connect your GraphQL server to an existing GraphQL API using DataSources.

**Note: This is designed to work with  [Apollo Server 2.0](https://www.apollographql.com/docs/apollo-server/whats-new.html) and [Data Sources](https://www.apollographql.com/docs/apollo-server/features/data-sources.html)**

## GraphQL Data Source

### Install

```
yarn add apollo-datasource-graphql
```

or

```
npm i apollo-datasource-graphql --save
```

### Usage

Define a data source by extending the `GraphQLDataSource` class. You can then implement the queries and mutations that your resolvers require.


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

export class CraftBeerGraphQLAPI extends GraphQLDataSource {
  baseURL = 'https//craft-beer-api.example/graphql';

  async getCraftBeers() {
    try {
      const response = await this.query(CRAFT_BEERS);

      return response.data.craftBeers;
    } catch (error) {
      console.error(error);
    }
  }
}
```

### GraphQL Operations

The `query` and `mutation` methods on the `GraphQLDataSource` make a request to the GraphQL server. Both accepts a second parameter, `options`, which can be used to pass variables, context, etc.

```javascript
async searchCraftBeerByName(name) {
  try {
    const response = await this.query(CRAFT_BEERS, {
      variables: {
        name,
      },
    });

    return response.data.craftBeer;
  } catch (error) {
    console.error(error);
  }
}
```

|Parameter   |Description   |Required|
|---|---|---|
|graphQLDocument|A GraphQL document|true|
|options|An object that defines options to pass with the GraphQL request|false|


|Options   |Description   |Required|
|---|---|---|
|variables|A GraphQL document|false|
|operationName|A string name of the query if it is named, otherwise it is null|false|
|context|Metadata to be passed between Apollo Links|false|
|extensions|A map to store extensions data to be sent to the server|false|

### Intercepting Operations

You can intercept the request to set headers on an outgoing request. Since Apollo Data Sources have access to GraphQL context, you can store a user token or other information you need to have available when making a request.

Add the method `willSendRequest` to your class which will receive the `request` object. Here, you can modify the request to meet your needs.

```javascript
  willSendRequest(request) {
    const { accessToken } = this.context;

    if (!request.headers) {
      request.headers = {};
    }
    
    request.headers.authorization = accessToken;
  }
```

## TODO

- [x] Complete README
- [x] Mutation method
- [ ] Test Suite
- [ ] Request caching
