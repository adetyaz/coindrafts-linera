use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};
use simple_todo::TodoItem;

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct SimpleTodoState {
    pub todos: MapView<u64, TodoItem>,
    pub next_id: RegisterView<u64>,
}
