use std::sync::Arc;
use async_graphql::{Request, Response, Schema, EmptySubscription, Object, Context, FieldResult};
use linera_sdk::{
    base::WithServiceAbi, Service, ServiceRuntime,
};
use crate::{SimpleTodoAbi, Request as TodoRequest, Response as TodoResponse, Todo};
use crate::state::SimpleTodoState;

pub struct SimpleTodoService {
    state: Arc<SimpleTodoState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(SimpleTodoService);

impl WithServiceAbi for SimpleTodoService {
    type Abi = SimpleTodoAbi;
}

impl Service for SimpleTodoService {
    type Parameters = ();

    async fn load(runtime: ServiceRuntime<Self>) -> Self {
        let state = SimpleTodoState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        SimpleTodoService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Self::Query) -> Self::QueryResponse {
        match request {
            TodoRequest::GetTodos => {
                let todos = self.state
                    .get_all_todos()
                    .await
                    .unwrap_or_else(|_| Vec::new());
                TodoResponse::Todos(todos)
            }
        }
    }
}

// GraphQL Schema and Resolvers

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// Get all todos
    async fn todos(&self, ctx: &Context<'_>) -> FieldResult<Vec<Todo>> {
        let service = ctx.data::<SimpleTodoService>()?;
        let todos = service.state.get_all_todos().await?;
        Ok(todos)
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Add a new todo
    async fn add_todo(&self, ctx: &Context<'_>, text: String) -> FieldResult<bool> {
        // Note: In a real implementation, mutations would need to be submitted
        // as operations to the contract via the Linera runtime
        // This is a simplified version for demonstration
        Ok(true)
    }

    /// Toggle a todo's completion status
    async fn toggle_todo(&self, ctx: &Context<'_>, id: u64) -> FieldResult<bool> {
        // Similar note as above - this would submit an operation to the contract
        Ok(true)
    }

    /// Delete a todo
    async fn delete_todo(&self, ctx: &Context<'_>, id: u64) -> FieldResult<bool> {
        // Similar note as above - this would submit an operation to the contract
        Ok(true)
    }
}

pub type TodoSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn create_schema() -> TodoSchema {
    Schema::build(QueryRoot, MutationRoot, EmptySubscription::default()).finish()
}