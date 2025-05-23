pub mod atom;
pub mod window;
use std::io::{self, BufRead, Write};
use window::list_windows;
use x11rb::connection::Connection;
use x11rb::protocol::xproto::AtomEnum;
use x11rb::protocol::xproto::*;
use x11rb::protocol::Event;
use x11rb::rust_connection::RustConnection;
use x11rb::wrapper::ConnectionExt as _;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (conn, screen_num) = RustConnection::connect(None)?;
    let screen = &conn.setup().roots[screen_num];

    let root = screen.root;

    // 获取 _NET_CLIENT_LIST
    let net_client_list_atom = conn.intern_atom(false, b"_NET_CLIENT_LIST")?.reply()?.atom;
    let net_wm_name_atom = conn.intern_atom(false, b"_NET_WM_NAME")?.reply()?.atom;
    let utf8_string_atom = conn.intern_atom(false, b"UTF8_STRING")?.reply()?.atom;
    let wm_name_atom = AtomEnum::WM_NAME;

    // 获取 _NET_ACTIVE_WINDOW 原子
    let net_active_window_atom = conn
        .intern_atom(false, b"_NET_ACTIVE_WINDOW")?
        .reply()?
        .atom;

    let windows = list_windows()?;

    for (i, win) in windows.iter().enumerate() {
        println!(
            "[{}] {:#010x}  {} localhost {}",
            i, win.id, win.desktop, win.title
        );
    }

    // 提示用户选择窗口
    print!("Enter window number to focus (or q to quit): ");
    io::stdout().flush()?;

    let stdin = io::stdin();
    let mut handle = stdin.lock();
    let mut input = String::new();
    handle.read_line(&mut input)?;

    let input = input.trim();
    if input == "q" {
        return Ok(());
    }

    // 解析用户输入
    match input.parse::<usize>() {
        Ok(index) if index < windows.len() => {
            let desktop_atom = conn.intern_atom(false, b"_NET_WM_DESKTOP")?.reply()?.atom;
            let active_desktop_atom = conn
                .intern_atom(false, b"_NET_CURRENT_DESKTOP")?
                .reply()?
                .atom;

            // 获取当前桌面
            let current_desktop = conn
                .get_property(false, root, active_desktop_atom, AtomEnum::CARDINAL, 0, 1)?
                .reply()?
                .value32()
                .unwrap()
                .next()
                .unwrap_or(0);

            let target_window_desktop = desktop_atom;
            // 如果不在当前桌面，切换过去
            if target_window_desktop != current_desktop {
                println!("Switching to desktop {}", target_window_desktop);
                conn.change_property32(
                    PropMode::REPLACE,
                    root,
                    active_desktop_atom,
                    AtomEnum::CARDINAL,
                    &[target_window_desktop],
                )?;
                conn.flush()?;
            }
            conn.flush()?;

            let window_id = windows[index].id;
            let window_title = &windows[index].title;

            println!("Focusing window: {}", window_title);

            // 发送 _NET_ACTIVE_WINDOW 消息来激活窗口
            let data = [
                1, // 来源指示: 1 表示应用程序
                x11rb::CURRENT_TIME,
                0, // 当前活动窗口 (不知道，所以设为0)
                0,
                0,
            ];
            let event = ClientMessageEvent {
                response_type: x11rb::protocol::xproto::CLIENT_MESSAGE_EVENT,
                format: 32,
                sequence: 0,
                window: window_id, // 被激活的窗口 ID
                type_: net_active_window_atom,
                data: ClientMessageData::from([
                    1,                   // source indication (application)
                    x11rb::CURRENT_TIME, // timestamp
                    0,
                    0,
                    0,
                ]),
            };

            // send to root window
            conn.send_event(
                false,
                root,
                EventMask::SUBSTRUCTURE_REDIRECT | EventMask::SUBSTRUCTURE_NOTIFY,
                event,
            )?;

            // let event = ClientMessageEvent {
            //     response_type: CLIENT_MESSAGE_EVENT,
            //     format: 32,
            //     sequence: 0,
            //     window: window_id,
            //     type_: net_active_window_atom,
            //     data: ClientMessageData::from(data),
            // };

            // conn.send_event(
            //     false,
            //     root,
            //     EventMask::SUBSTRUCTURE_REDIRECT | EventMask::SUBSTRUCTURE_NOTIFY,
            //     event,
            // )?;

            // conn.send_event(
            //     false,
            //     root,
            //     EventMask::SUBSTRUCTURE_REDIRECT | EventMask::SUBSTRUCTURE_NOTIFY,
            //     ClientMessageEvent::new(
            //         0,
            //         window_id,
            //         net_active_window_atom,
            //         ClientMessageData::from(data),
            //     ),
            // )?;

            conn.map_window(window_id)?;
            conn.flush()?;
            println!("Window focused successfully {}", window_id);
        }
        _ => {
            println!("Invalid selection");
        }
    }

    Ok(())
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
