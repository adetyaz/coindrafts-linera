import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

// Linera service GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL queries and mutations
export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      text
      completed
      created_at
    }
  }
`;

export const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    add_todo(text: $text)
  }
`;

export const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: Int!) {
    toggle_todo(id: $id)
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    delete_todo(id: $id)
  }
`;