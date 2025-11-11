pub mod contract;
pub mod service;
pub mod state;

use linera_sdk::base::{ContractAbi, ServiceAbi};
use serde::{Deserialize, Serialize};
use async_graphql::SimpleObject;

pub struct SimpleTodoAbi;

impl ContractAbi for SimpleTodoAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for SimpleTodoAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    AddTodo { text: String },
    ToggleTodo { id: u64 },
    DeleteTodo { id: u64 },
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Request {
    GetTodos,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Response {
    Todos(Vec<Todo>),
}

#[derive(Debug, Clone, Deserialize, Serialize, SimpleObject)]
pub struct Todo {
    pub id: u64,
    pub text: String,
    pub completed: bool,
    pub created_at: u64,
}