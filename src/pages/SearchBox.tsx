import type React from "react";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";
import { info } from "@tauri-apps/plugin-log";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { LazyIcon } from "@/components/ui/icon";
import { listApplications } from "@/lib/api/searchApp";

interface Command {
  id: string;
  title: string;
  subtitle: string | null;
  type: string | null;
  iconPath: string | null;
  categories: string[];
  keywords?: string[];
  exec: string | null;
}

async function loadIcon(path: string) {
  return invoke<string>("read_icon_as_base64", { path });
}

function SearchBox() {
  const iconCache = useRef<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const [commands, setCommands] = useState<Command[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const PAGE_SIZE = 10;

  const searchApplications = async (
    query: string = "",
    pageNumber: number = 0,
  ) => {
    if (loadingRef.current) return;
    if (page !== 0 && !hasMore) return;
    loadingRef.current = true;

    const items = await listApplications(
      query,
      pageNumber * PAGE_SIZE,
      PAGE_SIZE,
    );

    const newCommands = items.map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.comment,
      type: item.type,
      iconPath: item.iconPath,
      categories: item.categories,
      keywords: item.keywords,
      exec: item.exec,
    }));

    if (pageNumber === 0) {
      setCommands(newCommands);
    } else {
      setCommands((prev) => [...prev, ...newCommands]);
    }
    setHasMore(items.length === PAGE_SIZE);
    loadingRef.current = false;
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadingRef.current = false;
    searchApplications(query, 0);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < commands.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : commands.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (commands[selectedIndex]) {
            info(
              `Executing: ${commands[selectedIndex].title} EXEC ${commands[selectedIndex].exec}`,
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, commands, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el || loadingRef.current || !hasMore) return;

      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
      if (nearBottom) {
        const nextPage = page + 1;
        setPage(nextPage);
        searchApplications(query, nextPage);
      }
    };

    const el = scrollRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, query]);

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-black/50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Press ⌘ + Space to open Raycast</p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Open Raycast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black/50 flex justify-center items-start">
      <div className="w-full h-full flex flex-col rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search for apps and commands..."
              className="pl-10 border-0 focus-visible:ring-0 text-lg h-12 bg-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable results */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto h-full">
          {commands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {commands.map((command, index) => (
                <div
                  key={command.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    setSelectedIndex(index);
                    console.log(
                      `Executing: ${command.title} EXEC: ${command.exec}`,
                    );
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <LazyIcon
                      id={command.id}
                      iconPath={command.iconPath}
                      loadIcon={loadIcon}
                      iconCache={iconCache}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {command.title}
                      </h3>
                      {command.type && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                          {command.type}
                        </Badge>
                      )}
                      {command.categories.map((category, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {command.subtitle}
                    </p>
                  </div>
                  {index === selectedIndex && (
                    <div className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      ↵
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>⌘K Open</span>
          </div>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
