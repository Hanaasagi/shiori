use indexmap::IndexMap;
use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};
use std::process::Command;

use freedesktop_desktop_entry::{desktop_entries, get_languages_from_env};
use freedesktop_icons::{lookup, LookupBuilder};
use std::path::PathBuf;

use freedesktop_desktop_entry::DesktopEntry as FDesktopEntry;

#[derive(Debug, Clone)]
pub struct DesktopEntry {
    pub id: String,
    pub name: String,
    pub lower_name: String,
    pub type_: Option<String>,
    pub categories: Vec<String>,
    pub comment: Option<String>,
    pub exec: Option<String>,
    pub path: PathBuf,
}

impl DesktopEntry {
    pub fn icon<'a>(&'a self) -> LookupBuilder<'a> {
        lookup(&self.id)
    }
}

impl Serialize for DesktopEntry {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DesktopEntry", 8)?;

        state.serialize_field("id", &self.id)?;
        state.serialize_field("name", &self.name)?;
        state.serialize_field("type", &self.type_)?;
        state.serialize_field("categories", &self.categories)?;
        state.serialize_field("comment", &self.comment)?;
        state.serialize_field("exec", &self.exec)?;
        state.serialize_field("path", &self.path)?;
        state.serialize_field("iconPath", &self.icon().with_cache().find())?;

        state.end()
    }
}

pub struct ApplicationService {
    pub locales: Vec<String>,
    // ID -> DesktopEntry
    pub entries: IndexMap<String, DesktopEntry>,
}

impl ApplicationService {
    pub fn new(locales: &[String]) -> Self {
        let mut s = Self {
            locales: locales.to_vec(),
            entries: IndexMap::new(),
        };

        let mut items = desktop_entries(locales);
        items.sort_by(|a, b| a.id().to_lowercase().cmp(&b.id().to_lowercase()));
        for item in items.into_iter() {
            let id = item.id().to_string();
            let entry = s.convert_entry(item);
            s.entries.insert(id, entry);
        }

        s
    }

    pub fn launch(&self, id: &str, file_url: Option<&str>) -> std::io::Result<()> {
        let exec = self.get(id);
        if exec.is_none() {
            panic!("no exec");
        }
        let exec = exec.unwrap().exec.as_ref().unwrap();
        let expanded = exec
            .replace("%u", file_url.unwrap_or(""))
            .replace("%U", file_url.unwrap_or(""))
            .replace("%f", file_url.unwrap_or(""))
            .replace("%F", file_url.unwrap_or(""))
            .replace("%i", "")
            .replace("%c", "")
            .replace("%k", "");

        // 2. 拆分字符串为程序和参数（注意处理引号）
        let mut parts = shell_words::split(&expanded).expect("Failed to parse Exec line");
        if parts.is_empty() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No command found",
            ));
        }

        // 3. 构造并启动命令
        let program = parts.remove(0);
        Command::new(program).args(parts).spawn()?; // 也可以用 `.status()?` 或 `.output()?`

        Ok(())
    }

    fn convert_entry(&self, entry: FDesktopEntry) -> DesktopEntry {
        let locales = &self.locales;
        let name = entry.name(locales).unwrap_or_default();
        DesktopEntry {
            id: entry.id().to_string(),
            name: name.to_string(),
            lower_name: name.to_lowercase(),
            type_: entry.type_().map(String::from),
            categories: entry
                .categories()
                .unwrap_or_default()
                .into_iter()
                .filter_map(|s| {
                    if s.len() > 0 {
                        Some(s.to_string())
                    } else {
                        None
                    }
                })
                .collect(),
            comment: entry.comment(locales).map(String::from),
            exec: entry.exec().map(String::from),
            // path: entry.path().map(PathBuf::from),
            path: entry.path,
        }
    }

    pub fn default() -> Self {
        let locales = get_languages_from_env();
        Self::new(&locales)
    }

    pub fn refresh(&mut self) {
        self.entries.clear();

        let mut items = desktop_entries(&self.locales);
        items.sort_by(|a, b| a.id().to_lowercase().cmp(&b.id().to_lowercase()));
        for item in items.into_iter() {
            let id = item.id().to_string();
            let entry = self.convert_entry(item);
            self.entries.insert(id, entry);
        }
    }

    pub fn get(&self, id: &str) -> Option<&DesktopEntry> {
        self.entries.get(id)
    }

    pub fn get_by_name(&self, name: &str) -> Option<&DesktopEntry> {
        let lower_name = name.to_lowercase();
        for (_, entry) in &self.entries {
            if name == entry.name {
                return Some(entry);
            }
            if lower_name == entry.name.to_lowercase() {
                return Some(entry);
            }
        }
        None
    }
}
