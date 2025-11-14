#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{Request, Response, Schema, EmptySubscription, Object};
use simple_todo::{SimpleTodoAbi, SimpleTodoOperation, TodoItem};
use self::state::SimpleTodoState;
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

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

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = SimpleTodoState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        SimpleTodoService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let query_root = QueryRoot {
            state: self.state.clone(),
        };
        let schema = Schema::build(
            query_root,
            SimpleTodoOperation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

// Add async-graphql derive to make SimpleTodoState a GraphQL Object
// This is done in the state.rs file instead
struct QueryRoot {
    state: Arc<SimpleTodoState>,
}

#[Object]
impl QueryRoot {
    async fn todos(&self) -> Vec<TodoItem> {
        let mut todos = Vec::new();
        for index in self.state.todos.indices().await.unwrap_or_default() {
            if let Ok(Some(todo)) = self.state.todos.get(&index).await {
                todos.push(todo);
            }
        }
        todos
    }
}
