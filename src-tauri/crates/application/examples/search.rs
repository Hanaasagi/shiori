use application::ApplicationService;

fn main() {
    let service = ApplicationService::default();

    for (id, entry) in &service.entries {
        let name = &entry.name;
        if name.contains("Alacritty") {
            println!("{:?}", entry);
            service.launch(id, Some(""));
        } else {
            continue;
        }
    }

    let entry = service.get_by_name("neovim").unwrap();
    println!("{:?}", entry.icon().with_cache().find());
}
