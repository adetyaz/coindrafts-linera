#![cfg_attr(target_arch = "wasm32", no_main)]

use async_graphql::{Request, Response, SimpleObject};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

pub struct SimpleTodoAbi;

impl ContractAbi for SimpleTodoAbi {
    type Operation = SimpleTodoOperation;
    type Response = ();
}

impl ServiceAbi for SimpleTodoAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Serialize, Deserialize, GraphQLMutationRoot)]
pub enum SimpleTodoOperation {
    AddTodo { text: String },
    EditTodo { id: u64, text: String },
    DeleteTodo { id: u64 },
    ToggleTodo { id: u64 },
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct TodoItem {
    pub id: u64,
    pub text: String,
    pub completed: bool,
    pub created_at: u64,
}
