import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Search } from "lucide-react";
import emojiData from "@emoji-mart/data";
import { EmojiMartData } from "@emoji-mart/data";
import { init } from "emoji-mart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function unifiedToNative(unified: string) {
  return unified
    .split("-")
    .map((u) => String.fromCodePoint(parseInt(u, 16)))
    .join("");
}

const emojiCategories = [
  { id: "people", name: "Smileys & People" },
  { id: "nature", name: "Animals & Nature" },
  { id: "foods", name: "Food & Drink" },
  { id: "activity", name: "Activities" },
  { id: "places", name: "Travel & Places" },
  { id: "objects", name: "Objects" },
  { id: "symbols", name: "Symbols" },
  { id: "flags", name: "Flags" },
];

export default function EmojiPicker() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadedGroupCount, setLoadedGroupCount] = useState(2);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // lazy init
  const data = emojiData as EmojiMartData;
  const categories = data.categories.filter((c) => c.id !== "custom");

  const categoryMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; emojis: string[]; count: number }
    >();
    for (const cat of categories) {
      map.set(cat.id, {
        name: cat.name,
        emojis: cat.emojis,
        count: cat.emojis.length,
      });
    }
    return map;
  }, [categories]);

  useEffect(() => {
    init({ data });
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current || selectedCategory !== "all") return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setLoadedGroupCount((prev) =>
        prev < categories.length ? prev + 2 : prev,
      );
    }
  };

  useEffect(() => {
    const div = scrollRef.current;
    if (div) {
      div.addEventListener("scroll", handleScroll);
      return () => div.removeEventListener("scroll", handleScroll);
    }
  }, [scrollRef.current, selectedCategory]);

  const renderEmojiButtons = (emojis: string[]) =>
    emojis.map((code, index) => {
      const emoji = data.emojis[code];
      if (!emoji) return null;
      return (
        <button
          key={code + index}
          className="h-14 w-full flex items-center justify-center text-2xl rounded-md hover:bg-gray-200 bg-gray-100"
        >
          {unifiedToNative(emoji.skins[0].unified)}
        </button>
      );
    });

  return (
    <div className="w-screen h-screen bg-black/50 flex justify-center items-start">
      <div className="w-full h-full flex flex-col rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 h-12">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for apps and commands..."
                className="pl-10 border-0 focus-visible:ring-0 text-lg h-full bg-transparent flex-1"
                autoFocus
              />
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setLoadedGroupCount(2); // reset if switching back to "all"
                }}
              >
                <SelectTrigger className="h-full border-gray-300 w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {emojiCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Emoji Display */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto h-full px-4 pb-4 space-y-6"
        >
          {selectedCategory === "all" ? (
            categories.slice(0, loadedGroupCount).map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm text-gray-600">
                    {
                      emojiCategories.filter((cat_) => cat_.id === cat.id)[0]
                        .name
                    }
                  </h3>
                  <span className="text-xs text-gray-400">
                    {cat.emojis.length}
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {renderEmojiButtons(cat.emojis)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {renderEmojiButtons(
                categoryMap.get(selectedCategory)?.emojis ?? [],
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
              <Search className="h-3 w-3" />
            </div>
            <span className="text-sm text-gray-600">
              Search Emoji & Symbols - Face Blowing A Kiss
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Paste to Firefox Nightly
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-6 w-6">
                <span className="text-xs">⏎</span>
              </Button>
              <span className="text-sm text-gray-600">Actions</span>
              <Button variant="outline" size="icon" className="h-6 w-6">
                <span className="text-xs">⌘</span>
              </Button>
              <Button variant="outline" size="icon" className="h-6 w-6">
                <span className="text-xs">K</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
