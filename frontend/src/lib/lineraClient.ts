import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

// Linera service GraphQL endpoint
const httpLink = new HttpLink({
	uri: 'http://localhost:8080/chains/3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e/applications/291a8797a591dee08a8cad1420a740520577f88d611548ff697df2eb14ed73e8'
});

export const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache({
		typePolicies: {
			Mutation: {
				fields: {
					addTodo: {
						merge: false
					},
					toggleTodo: {
						merge: false
					},
					deleteTodo: {
						merge: false
					},
					editTodo: {
						merge: false
					}
				}
			}
		}
	}),
	defaultOptions: {
		watchQuery: {
			errorPolicy: 'all'
		},
		query: {
			errorPolicy: 'all'
		},
		mutate: {
			errorPolicy: 'ignore',
			fetchPolicy: 'no-cache'
		}
	}
});

// GraphQL queries and mutations
export const GET_TODOS = gql`
	query GetTodos {
		todos {
			id
			text
			completed
			createdAt
		}
	}
`;

export const ADD_TODO = gql`
	mutation AddTodo($text: String!) {
		addTodo(text: $text)
	}
`;

export const TOGGLE_TODO = gql`
	mutation ToggleTodo($id: Int!) {
		toggleTodo(id: $id)
	}
`;

export const DELETE_TODO = gql`
	mutation DeleteTodo($id: Int!) {
		deleteTodo(id: $id)
	}
`;

export const EDIT_TODO = gql`
	mutation EditTodo($id: Int!, $text: String!) {
		editTodo(id: $id, text: $text)
	}
`;
