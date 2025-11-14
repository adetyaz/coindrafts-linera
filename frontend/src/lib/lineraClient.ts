import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

// Linera service GraphQL endpoint
const httpLink = new HttpLink({
	uri: 'http://localhost:8080/chains/5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0/applications/cb15f2be1bb53075b79257d79ac7e4e5cfef76b3e2db6f73ee48ede2cd192311'
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
