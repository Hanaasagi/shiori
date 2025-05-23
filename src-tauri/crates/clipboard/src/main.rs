// use arboard::Clipboard;

// fn main() {
//     let mut clipboard = Clipboard::new().unwrap();
//     println!("Clipboard text was: {}", clipboard.get_text().unwrap());

//     let the_string = "Hello, world!";
//     clipboard.set_text(the_string).unwrap();
//     println!("But now the clipboard text should be: \"{}\"", the_string);
// }

use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use walkdir::WalkDir;

fn main() {
    let entries: Vec<String> = WalkDir::new(".")
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
        .map(|e| e.path().display().to_string())
        .collect();

    let matcher = SkimMatcherV2::default();

    let query = "main";

    let mut matches: Vec<_> = entries
        .iter()
        .filter_map(|line| matcher.fuzzy_match(line, query).map(|score| (score, line)))
        .collect();

    matches.sort_by(|a, b| b.0.cmp(&a.0));

    for (_score, line) in matches.iter().take(10) {
        println!("{} {}", _score, line);
    }
}
