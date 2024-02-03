// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn build(path: &str) -> String {
    let output = Command::new("scarb")
        .args(&["build"])
        .current_dir(path.to_string())
        .output();

        match output {
          Ok(output) => {
              println!("Status: {}", output.status);
              // println!("Output: {:?}", String::from_utf8_lossy(&output.stdout));
              // println!("Error: {:?}", String::from_utf8_lossy(&output.stderr));
          }
          Err(err) => {
              eprintln!("Failed to execute command: {:?}", err);
          }
      }

    format!("Hello, {}!", path)
}

#[tauri::command]
fn greet(path: &str) -> String {
    let output = Command::new("cargo")
        .args(&["run"])
        .current_dir(path.to_string())
        .output();

        match output {
          Ok(output) => {
              println!("Status: {}", output.status);
              // println!("Output: {:?}", String::from_utf8_lossy(&output.stdout));
              // println!("Error: {:?}", String::from_utf8_lossy(&output.stderr));
          }
          Err(err) => {
              eprintln!("Failed to execute command: {:?}", err);
          }
      }

    format!("Hello, {}!", path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
