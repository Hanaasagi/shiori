import React from "react";
import { Sun, Moon, Camera, Github, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // const [isDark, setIsDark] = React.useState(false);
  // const location = useLocation();

  // const toggleTheme = () => {
  //   setIsDark(!isDark);
  //   document.documentElement.classList.toggle("dark");
  // };

  return <main className="flex-1 mt-0 mb-0 antialiased">{children}</main>;

  return (
    <div className="flex flex-col min-h-screen min-w-[1024px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* <header className="p-4 border-b border-gray-200 dark:border-gray-700"> */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="flex items-center justify-between h-16">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> */}
          <Input
            // value={query}
            // onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for apps and commands..."
            className="pl-10 border-0 focus-visible:ring-0 text-lg h-12 bg-transparent"
            autoFocus
          />
        </div>
      </header>

      <main className="flex-1 mt-16 mb-16">{children}</main>

      <footer className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Made with ❤️ by{" "}
            <a
              href="https://github.com/Hanaasagi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gray-800 dark:hover:text-gray-200"
            >
              Hanaasagi
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
