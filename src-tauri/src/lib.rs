use application::ApplicationService;
use std::sync::Mutex;
use tracing_subscriber::FmtSubscriber;

use log;
use tauri::Manager;
use tauri_plugin_clipboard_manager::ClipboardExt;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(tracing::Level::TRACE)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::list_applications,
            commands::read_icon_as_base64,
            commands::launch_application,
        ])
        .manage(commands::AppState {
            service: Mutex::new(ApplicationService::default()),
        })
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            // Read content from clipboard
            let content = app.clipboard().read_text();
            if let Ok(content) = content {
                println!("{:?}", content);
            } else {
                println!(
                    "Failed to read content from clipboard {}",
                    content.unwrap_err()
                );
            }
            // Prints "Tauri is awesome!" to the terminal
            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        // .invoke_handler(tauri::generate_handler![list_applications])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
