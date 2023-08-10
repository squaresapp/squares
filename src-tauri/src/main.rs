#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use objc::runtime::{Class, Object, BOOL, YES};
use objc::{class, msg_send, sel, sel_impl};
use objc_id::Id;
use std::ptr;

#[link(name = "AppKit", kind = "framework")]
extern "C" {}

fn main() {
	use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
	
	let new_menu_item = CustomMenuItem
		::new("new".to_string(), "New")
		.accelerator("CmdOrCtrl+n");
	
	let close_menu_item = CustomMenuItem
		::new("close".to_string(), "Close Window")
		.accelerator("CmdOrCtrl+w");
	
	let file_menu = Submenu::new("File", Menu::new()
		.add_item(new_menu_item)
		.add_native_item(MenuItem::Separator)
		.add_item(close_menu_item));
	
	let browse_menu_item = CustomMenuItem
		::new("browse".to_string(), "Show Browser")
		.accelerator("CmdOrCtrl+1");
	
	let writer_menu_item = CustomMenuItem
		::new("writer".to_string(), "Show Writer")
		.accelerator("CmdOrCtrl+2");
	
	let decorator_menu_item = CustomMenuItem
		::new("decorator".to_string(), "Show Decorator")
		.accelerator("CmdOrCtrl+3");
	
	let previewer_menu_item = CustomMenuItem
		::new("previewer".to_string(), "Show Previewer")
		.accelerator("CmdOrCtrl+4");
	
	let publisher_menu_item = CustomMenuItem
		::new("publisher".to_string(), "Show Publisher")
		.accelerator("CmdOrCtrl+5");
	
	let view_menu = Submenu::new("View", Menu::new()
		.add_item(browse_menu_item)
		.add_native_item(MenuItem::Separator)
		.add_item(writer_menu_item)
		.add_item(decorator_menu_item)
		.add_item(previewer_menu_item)
		.add_native_item(MenuItem::Separator)
		.add_item(publisher_menu_item));
	
	let main_menu = Menu::new()
		.add_native_item(MenuItem::Copy)
		.add_item(CustomMenuItem::new("hide", "Hide"))
		.add_submenu(file_menu)
		.add_submenu(view_menu);
	
	let context = tauri::generate_context!();
	
	tauri::Builder::default()
		.plugin(tauri_plugin_window_state::Builder::default().build())
		.plugin(tauri_plugin_fs_watch::init())
		.plugin(tauri_plugin_fs_extra::init())
		.invoke_handler(tauri::generate_handler![get_clipboard_change_count])
		.menu(main_menu)
		//.menu(tauri::Menu::os_default(&context.package_info().name))
		.on_menu_event(move |event| {
			
			let win = event.window();
			let id = event.menu_item_id().to_string();
			let fmt = format!("
				window.dispatchEvent(new CustomEvent(
					'menu', 
					{{
						detail: {{
							itemId: \"{id}\"
						}}
					}}
				));
			");
			
			let _ = win.eval(&fmt);
		})
		/*
		.setup(|app| {
			// Automatically open devtools in debug mode
			#[cfg(debug_assertions)] // only include this code on debug builds
			{
				let window = app.get_window("main").unwrap();
				window.open_devtools();
				window.close_devtools();
			}
			Ok(())
		})
		*/
		.run(context)
		.expect("error while running tauri application");
}

/** */
#[tauri::command]
fn get_clipboard_change_count() -> i64 {
	let cls = match Class::get("NSPasteboard") {
		Some(cls) => cls,
		None => return -1,
	};
	
	let pasteboard: *mut Object = unsafe { msg_send![cls, generalPasteboard] };
	
	if pasteboard.is_null() {
		return -1;
	}
	
	let pasteboard: Id<Object> = unsafe { Id::from_ptr(pasteboard) };
	let change_count: i64 = unsafe { msg_send![pasteboard, changeCount] };
	change_count.into()
}

