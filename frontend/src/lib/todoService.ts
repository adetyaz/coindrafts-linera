import { client, GET_TODOS, ADD_TODO, TOGGLE_TODO, DELETE_TODO } from './lineraClient';
import { todos, loading, error } from './stores';
import { config } from './config';

interface TodosQueryResult {
	todos: Array<{
		id: number;
		text: string;
		completed: boolean;
		createdAt: number;
	}>;
}

interface MutationResult {
	success: boolean;
}

class TodoService {
	async fetchTodos(): Promise<void> {
		loading.set(true);
		error.set(null);

		try {
			const result = await client.query<TodosQueryResult>({
				query: GET_TODOS,
				fetchPolicy: 'network-only' // Always fetch fresh data
			});

			if (result.data && result.data.todos) {
				todos.set(result.data.todos);
			}
		} catch (err) {
			console.error('Error fetching todos:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error.set(errorMessage);
		} finally {
			loading.set(false);
		}
	}

	async addTodo(text: string): Promise<MutationResult | undefined> {
		if (!text.trim()) return;

		try {
			loading.set(true);

			// In a real Linera app, this would submit an operation to the chain
			// For now, we'll simulate the mutation
			await client.mutate({
				mutation: ADD_TODO,
				variables: { text: text.trim() }
			});

			// Refresh todos after adding
			await this.fetchTodos();

			return { success: true };
		} catch (err) {
			console.error('Error adding todo:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error.set(errorMessage);
			throw err;
		} finally {
			loading.set(false);
		}
	}

	async toggleTodo(id: number): Promise<MutationResult | undefined> {
		try {
			loading.set(true);

			await client.mutate({
				mutation: TOGGLE_TODO,
				variables: { id }
			});

			// Refresh todos after toggling
			await this.fetchTodos();

			return { success: true };
		} catch (err) {
			console.error('Error toggling todo:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error.set(errorMessage);
			throw err;
		} finally {
			loading.set(false);
		}
	}

	async deleteTodo(id: number): Promise<MutationResult | undefined> {
		try {
			loading.set(true);

			await client.mutate({
				mutation: DELETE_TODO,
				variables: { id }
			});

			// Refresh todos after deleting
			await this.fetchTodos();

			return { success: true };
		} catch (err) {
			console.error('Error deleting todo:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error.set(errorMessage);
			throw err;
		} finally {
			loading.set(false);
		}
	}
}

export const todoService = new TodoService();
