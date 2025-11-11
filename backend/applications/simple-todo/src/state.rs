use linera_sdk::views::{MapView, RegisterView, RootView, ViewStorageContext};
use serde::{Deserialize, Serialize};
use crate::Todo;

/// The application state for SimpleTodo
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct SimpleTodoState {
    /// Map of todos by ID for easy access and updates
    pub todos: MapView<u64, Todo>,
    /// Counter for generating unique todo IDs
    pub next_id: RegisterView<u64>,
}

impl SimpleTodoState {
    /// Add a new todo item
    pub async fn add_todo(&mut self, text: String, timestamp: u64) -> Result<(), anyhow::Error> {
        let id = self.next_id.get();
        let todo = Todo {
            id,
            text,
            completed: false,
            created_at: timestamp,
        };
        
        self.todos.insert(&id, todo)?;
        self.next_id.set(id + 1);
        Ok(())
    }

    /// Toggle a todo's completion status
    pub async fn toggle_todo(&mut self, id: u64) -> Result<(), anyhow::Error> {
        if let Some(mut todo) = self.todos.get(&id).await? {
            todo.completed = !todo.completed;
            self.todos.insert(&id, todo)?;
        }
        Ok(())
    }

    /// Delete a todo by ID
    pub async fn delete_todo(&mut self, id: u64) -> Result<(), anyhow::Error> {
        self.todos.remove(&id)?;
        Ok(())
    }

    /// Get all todos
    pub async fn get_all_todos(&self) -> Result<Vec<Todo>, anyhow::Error> {
        let mut todos = Vec::new();
        
        self.todos.for_each_index_value(|_key, value| {
            todos.push(value.clone());
            Ok(())
        }).await?;
        
        // Sort by creation time
        todos.sort_by_key(|todo| todo.created_at);
        Ok(todos)
    }
}