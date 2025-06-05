import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import "./App.css";
import { LogicalSize, LogicalPosition } from "@tauri-apps/api/window";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { currentMonitor } from "@tauri-apps/api/window";

import EmojiPicker from "@/pages/EmojiPicker";
import { error } from "@tauri-apps/plugin-log";
import SearchBox from "@/pages/SearchBox";

async function init() {
  try {
    const monitor = await currentMonitor();
    if (!monitor) {
      return;
    }

    const appWindow = (
      await import("@tauri-apps/api/window")
    ).getCurrentWindow();

    await appWindow.setSize(new LogicalSize(1200, 600));
    // await appWindow.center();
    // await appWindow.setAlwaysOnTop(true);
    // await appWindow.setDecorations(true);

    const screenWidth = monitor.size.width;
    const windowSize = await appWindow.outerSize();

    const x = screenWidth - windowSize.width;
    const y = 0;

    await appWindow.setPosition(new LogicalPosition(x, y));
    await appWindow.show();
  } catch (e) {
    error(String(e));
  }
}

export default function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* <Route path="/" element={<SearchBox />} /> */}
          {/* <Route path="/emoji-picker" element={<EmojiPicker />} /> */}
          <Route path="/" element={<EmojiPicker />} />
        </Routes>
      </Layout>
    </Router>
  );
}
