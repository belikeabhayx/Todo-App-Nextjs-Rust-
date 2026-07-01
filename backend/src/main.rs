use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use uuid::Uuid;


#[derive(Serialize, Deserialize, Clone)]
struct Todo {
    id: String,
    title: String,
    completed: bool,
}

#[derive(Deserialize)]
struct CreateTodoRequest {
    title: String,
}

#[derive(Deserialize)]
struct UpdateTodoRequest {
    title: Option<String>,
    completed: Option<bool>,
}

struct AppState {
    todos: Mutex<Vec<Todo>>,
}

// Route Handlers

// ────────────────────────────────────────────────────────────────
// GET /todos  →  returns ALL todos as a JSON array
// ────────────────────────────────────────────────────────────────
#[get("/todos")]
async fn get_todos(data: web::Data<AppState>) -> impl Responder {
    let todos = data.todos.lock().unwrap();
    HttpResponse::Ok().json(todos.clone())
}

// ────────────────────────────────────────────────────────────────
// POST /todos  →  create a new todo, return it with HTTP 201
// ────────────────────────────────────────────────────────────────
#[post("/todos")]
async fn create_todo(
    data: web::Data<AppState>,
    body: web::Json<CreateTodoRequest>,
) -> impl Responder {
    let mut todos = data.todos.lock().unwrap();

    let new_todo = Todo {
        id: Uuid::new_v4().to_string(),
        title: body.title.clone(),
        completed: false,
    };

    todos.push(new_todo.clone());

    HttpResponse::Created().json(new_todo)
}

// ────────────────────────────────────────────────────────────────
// PATCH /todos/{id}  →  update title and/or completed for one todo
// ────────────────────────────────────────────────────────────────
#[patch("/todos/{id}")]
async fn update_todo(
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<UpdateTodoRequest>,
) -> impl Responder {
    let id = path.into_inner();
    let mut todos = data.todos.lock().unwrap();

    if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
        // For each Option field, only update if the client sent a value (Some).
        if let Some(title) = &body.title {
            todo.title = title.clone();
        }
        if let Some(completed) = body.completed {
            todo.completed = completed; // bool is Copy so no clone needed
        }
        HttpResponse::Ok().json(todo.clone())
    } else {
        // `serde_json::json!` macro — build a JSON value inline
        HttpResponse::NotFound().json(serde_json::json!({ "error": "Todo not found" }))
    }
}

// ────────────────────────────────────────────────────────────────
// DELETE /todos/{id}  →  remove one todo, return 204 No Content
// ────────────────────────────────────────────────────────────────
#[delete("/todos/{id}")]
async fn delete_todo(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> impl Responder {
    let id = path.into_inner();
    let mut todos = data.todos.lock().unwrap();

    if let Some(pos) = todos.iter().position(|t| t.id == id) {
        todos.remove(pos); // remove by index — shifts everything after it left
        // 204 No Content — success, nothing to return in the body
        HttpResponse::NoContent().finish()
    } else {
        HttpResponse::NotFound().json(serde_json::json!({ "error": "Todo not found" }))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🦀 Rust Todo API  →  http://localhost:8080");
    println!("   Press Ctrl-C to stop.\n");

    let app_state = web::Data::new(AppState {
        todos: Mutex::new(Vec::new()), // start with an empty list
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE"])
            .allowed_headers(vec![actix_web::http::header::CONTENT_TYPE])
            .max_age(3600); // cache the preflight response for 1 hour

        App::new()
            .wrap(cors)               
            .app_data(app_state.clone()) 
            // Register each route handler function:
            .service(get_todos)
            .service(create_todo)
            .service(update_todo)
            .service(delete_todo)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await // suspend here until the server shuts down (Ctrl-C)
}