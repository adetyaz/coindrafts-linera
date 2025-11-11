use linera_sdk::{
    base::WithContractAbi,
    Contract, ContractRuntime,
};
use crate::{Operation, SimpleTodoAbi};
use crate::state::SimpleTodoState;

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

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = SimpleTodoState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        SimpleTodoContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        // Initialize the next_id counter to 1
        self.state.next_id.set(1);
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::AddTodo { text } => {
                let timestamp = self.runtime.system_time().micros();
                self.state
                    .add_todo(text, timestamp)
                    .await
                    .expect("Failed to add todo");
            }
            Operation::ToggleTodo { id } => {
                self.state
                    .toggle_todo(id)
                    .await
                    .expect("Failed to toggle todo");
            }
            Operation::DeleteTodo { id } => {
                self.state
                    .delete_todo(id)
                    .await
                    .expect("Failed to delete todo");
            }
        }
    }

    async fn execute_message(&mut self, _message: Self::Message) {
        panic!("Messages not supported");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}