#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use simple_todo::{SimpleTodoAbi, SimpleTodoOperation, TodoItem};
use self::state::SimpleTodoState;
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};



pub struct SimpleTodoContract {
    state: SimpleTodoState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(SimpleTodoContract);

impl WithContractAbi for SimpleTodoContract {
    type Abi = SimpleTodoAbi;
}

impl Contract for SimpleTodoContract {
    type Message = ();
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = SimpleTodoState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        SimpleTodoContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        self.state.next_id.set(1);
    }

    async fn execute_operation(&mut self, operation: SimpleTodoOperation) -> () {
        match operation {
            SimpleTodoOperation::AddTodo { text } => {
                let id = *self.state.next_id.get();
                let timestamp = self.runtime.system_time().micros();
                let todo = TodoItem {
                    id,
                    text,
                    completed: false,
                    created_at: timestamp,
                };
                self.state.todos.insert(&id, todo).expect("Failed to insert todo");
                self.state.next_id.set(id + 1);
            }
            SimpleTodoOperation::EditTodo { id, text } => {
                if let Ok(Some(mut todo)) = self.state.todos.get(&id).await {
                    todo.text = text;
                    self.state.todos.insert(&id, todo).expect("Failed to update todo");
                }
            }
            SimpleTodoOperation::DeleteTodo { id } => {
                self.state.todos.remove(&id).expect("Failed to remove todo");
            }
            SimpleTodoOperation::ToggleTodo { id } => {
                if let Ok(Some(mut todo)) = self.state.todos.get(&id).await {
                    todo.completed = !todo.completed;
                    self.state.todos.insert(&id, todo).expect("Failed to update todo");
                }
            }
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Messages not supported");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
