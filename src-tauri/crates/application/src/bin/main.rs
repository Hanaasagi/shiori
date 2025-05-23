// use application::ApplicationService; // `application` 是 crate 名，来自 Cargo.toml 的 name 字段

// fn main() {
//     let service = ApplicationService::default();

//     for entry in &service.entries {
//         let path_src = freedesktop_desktop_entry::PathSource::guess_from(&entry.path);
//         println!(
//             "{:?}: {}\n---\n{:?}",
//             path_src,
//             entry.path.display(),
//             entry.exec()
//         );
//     }
// }

use application::ApplicationService;
use freedesktop_desktop_entry::DesktopEntry;

fn main() {
    let service = ApplicationService::default();
    let locales = &service.locales;

    for (id, entry) in &service.entries {
        let name = &entry.name;
        // if name.contains("Firefox") {
        if name.contains("Alacritty") {
            println!("{:?}", entry);
            service.launch_from_exec(id, Some(""));
        } else {
            continue;
        }
        // println!("ID: {}", entry.id());
        // println!("Name: {id}");
        // println!("Exec: {:?}", entry.exec());
        // println!("Path: {}", entry.path.display());
        // if let Some(icon_path) = service
        //     .lookup_icon(&name)
        //     .with_size(48)
        //     .with_scale(2)
        //     .with_theme("Arc")
        //     .with_cache()
        //     .find()
        // {
        //     println!("Icon: {:?}", icon_path);
        // }
        println!("---");
    }

    let entry = service.get_by_name("vim").unwrap();
    println!("{:?}", entry.icon().with_cache().find());
}
