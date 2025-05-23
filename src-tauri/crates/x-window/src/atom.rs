use anyhow::Result;
use once_cell::sync::Lazy;
use std::sync::Mutex;
use x11rb::connection::Connection;
use x11rb::protocol::xproto::*;
use x11rb::protocol::xproto::{Atom, AtomEnum};
use x11rb::rust_connection::RustConnection;

/// 全局缓存，每个 atom 只获取一次
static ATOMS: Lazy<Mutex<Option<Atoms>>> = Lazy::new(|| Mutex::new(None));

#[derive(Debug, Clone)]
pub struct Atoms {
    pub net_client_list: Atom,
    pub net_wm_name: Atom,
    pub utf8_string: Atom,
    pub wm_name: Atom,
    pub net_wm_desktop: Atom,
    pub net_active_window: Atom,
}

impl Atoms {
    pub fn load<C: Connection>(conn: &C) -> Result<()> {
        let mut lock = ATOMS.lock().unwrap();
        if lock.is_none() {
            *lock = Some(Self {
                net_client_list: intern(conn, b"_NET_CLIENT_LIST")?,
                net_wm_name: intern(conn, b"_NET_WM_NAME")?,
                utf8_string: intern(conn, b"UTF8_STRING")?,
                wm_name: AtomEnum::WM_NAME.into(),
                net_wm_desktop: intern(conn, b"_NET_WM_DESKTOP")?,
                net_active_window: intern(conn, b"_NET_ACTIVE_WINDOW")?,
            });
        }
        Ok(())
    }

    pub fn get() -> Option<Atoms> {
        ATOMS.lock().unwrap().clone()
    }
}

fn intern<C: Connection>(conn: &C, name: &[u8]) -> Result<Atom> {
    Ok(conn.intern_atom(false, name)?.reply()?.atom)
}
