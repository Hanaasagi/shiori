use crate::atom::Atoms;
use anyhow::{anyhow, Result};
use x11rb::atom_manager;
use x11rb::connection::Connection;
use x11rb::protocol::xproto::*;
use x11rb::protocol::Event;
use x11rb::rust_connection::RustConnection;

#[derive(Debug)]
pub struct WindowInfo {
    pub id: u32,
    pub desktop: u32,
    pub title: String,
}

fn get_window_title<C: Connection>(
    conn: &C,
    window: u32,
    net_wm_name: u32,
    utf8_string: u32,
    fallback_atom: u32,
) -> Result<String, Box<dyn std::error::Error>> {
    let title_reply = conn
        .get_property(false, window, net_wm_name, utf8_string, 0, u32::MAX)?
        .reply();

    let title = match title_reply {
        Ok(reply) if reply.value_len > 0 => String::from_utf8_lossy(&reply.value).into_owned(),
        _ => {
            // fallback to WM_NAME
            let fallback_reply = conn
                .get_property(false, window, fallback_atom, AtomEnum::STRING, 0, u32::MAX)?
                .reply();
            fallback_reply
                .map(|r| String::from_utf8_lossy(&r.value).into_owned())
                .unwrap_or_default()
        }
    };

    Ok(title)
}

pub fn list_windows() -> Result<Vec<WindowInfo>> {
    let (conn, screen_num) = RustConnection::connect(None)?;
    let screen = &conn.setup().roots[screen_num];
    let root = screen.root;

    Atoms::load(&conn)?;
    let atoms = Atoms::get().expect("Atoms should be initialized");

    // Intern atoms
    let net_client_list = atoms.net_client_list;
    let net_wm_name = conn.intern_atom(false, b"_NET_WM_NAME")?.reply()?.atom;
    let utf8_string = conn.intern_atom(false, b"UTF8_STRING")?.reply()?.atom;
    println!("-> {}", utf8_string);
    let wm_name = AtomEnum::WM_NAME;
    let net_wm_desktop = conn.intern_atom(false, b"_NET_WM_DESKTOP")?.reply()?.atom;

    let reply = conn
        .get_property(false, root, net_client_list, AtomEnum::WINDOW, 0, u32::MAX)?
        .reply()?;

    if reply.format != 32 {
        return Err(anyhow!("Unexpected format from _NET_CLIENT_LIST"));
    }

    let window_ids = reply
        .value32()
        .ok_or(anyhow!("Failed to parse window list"))?;
    let mut result = Vec::new();

    for window in window_ids {
        // Get desktop
        let desktop_reply = conn
            .get_property(false, window, net_wm_desktop, AtomEnum::CARDINAL, 0, 1)?
            .reply()?;
        let desktop = desktop_reply.value32().unwrap().next().unwrap_or(0);

        // Get title
        let title = get_window_title(&conn, window, net_wm_name, utf8_string, wm_name.into())
            .unwrap_or_else(|_| String::from("<Unknown>"));

        result.push(WindowInfo {
            id: window,
            desktop,
            title,
        });
    }

    Ok(result)
}
