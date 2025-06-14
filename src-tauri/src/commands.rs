use application::ApplicationService;
use application::DesktopEntry;
use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use std::sync::Mutex;
use std::time::Instant;
use tauri::State;
use tracing::{info, instrument, warn};

use base64::{engine::general_purpose, Engine as _};
use std::path::Path;
use tokio::fs;

#[tauri::command]
#[instrument]
pub async fn read_icon_as_base64(path: String) -> Option<String> {
    let start = Instant::now();

    let mime = match path {
        _ if path.ends_with(".png") => "image/png",
        _ if path.ends_with(".svg") => "image/svg+xml",
        _ => "application/octet-stream",
    };

    let data = fs::read(Path::new(&path)).await.ok().map(|bytes| {
        let encoded = general_purpose::STANDARD.encode(&bytes);
        format!("data:{};base64,{}", mime, encoded)
    });

    info!("took {:?}", start.elapsed());
    data
}

pub(crate) struct AppState {
    pub(crate) service: Mutex<ApplicationService>,
}

fn list_applications_impl(
    state: State<AppState>,
    query: Option<&str>,
    offset: usize,
    limit: usize,
) -> Vec<DesktopEntry> {
    // println!("list_applications is called in Rust {:?}", query);
    let service = state.service.lock().unwrap();
    let matcher = SkimMatcherV2::default();

    if query.is_none() || query.as_ref().unwrap().is_empty() {
        return service
            .entries
            .values()
            .skip(offset)
            .take(limit)
            .map(|entry| entry.clone())
            .collect();
    }

    let mut matches: Vec<(i64, &DesktopEntry)> = service
        .entries
        .values()
        .filter_map(|entry| {
            matcher
                .fuzzy_match(&entry.name, query.as_ref().unwrap())
                .map(|score| (score, entry))
        })
        .collect();

    matches.sort_by(|a, b| b.0.cmp(&a.0));

    matches
        .into_iter()
        .skip(offset)
        .take(limit)
        .map(|(_, entry)| entry.clone())
        .collect()
}

#[tauri::command]
#[instrument(skip(state))]
pub(crate) fn list_applications(
    state: State<AppState>,
    query: Option<&str>,
    offset: usize,
    limit: usize,
) -> Vec<DesktopEntry> {
    let start = Instant::now();
    let res = list_applications_impl(state, query, offset, limit);

    info!("took {:?}", start.elapsed());

    res
}

#[tauri::command]
#[instrument(skip(state))]
pub(crate) fn launch_application(state: State<AppState>, app_id: &str) -> bool {
    let start = Instant::now();
    let service = state.service.lock().unwrap();

    match service.launch(app_id, None) {
        Ok(_) => {
            info!("took {:?}", start.elapsed());
            true
        }
        Err(e) => {
            warn!("error: {}, took {:?}", e, start.elapsed());
            false
        }
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub(crate) fn greet(name: &str) -> String {
    println!("greet is called in Rust");
    format!("Hello, {}! You've been greeted from Rust!", name)
}
