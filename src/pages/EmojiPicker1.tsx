"use client";

import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function EmojiPicker() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const frequentlyUsedEmojis = [
    "😘",
    "❤️",
    "😂",
    "😍",
    "😊",
    "🤔",
    "😄",
    "👍",
    "😌",
    "😔",
    "😁",
    "😢",
    "💋",
    "😒",
    "😳",
    "😜",
  ];
  const smileysAndPeopleEmojis = [
    "😀",
    "🙂",
    "😁",
    "😄",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "☺️",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "🥱",
    "😤",
    "😡",
    "😠",
    "🤬",
    "😈",
    "👿",
    "💀",
    "☠️",
    "💩",
    "🤡",
    "👹",
    "👺",
    "👻",
    "👽",
    "👾",
    "🤖",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
  ];
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

            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search for apps and commands..."
                className="pl-10 border-0 focus-visible:ring-0 text-lg h-12 bg-transparent flex-1"
                autoFocus
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger
                  // className="pl-10 border-0 focus-visible:ring-0 text-lg h-12 bg-transparent flex-1"
                  className="pl-10 border-0 h-12 border-gray-300 w-[120px]"
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="frequently">Frequently Used</SelectItem>
                  <SelectItem value="smileys">Smileys & People</SelectItem>
                  <SelectItem value="animals">Animals & Nature</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="travel">Travel & Places</SelectItem>
                  <SelectItem value="objects">Objects</SelectItem>
                  <SelectItem value="symbols">Symbols</SelectItem>
                  <SelectItem value="flags">Flags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Scrollable results */}
        <div className="flex-1 overflow-y-auto h-full px-4 pb-4">
          <div className="mb-4 p-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-600">Frequently Used</h3>
              <span className="text-xs text-gray-400">16</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {frequentlyUsedEmojis.map((emoji, index) => (
                <button
                  key={`frequent-${index}`}
                  className={`h-14 w-full flex items-center justify-center text-2xl rounded-md hover:bg-gray-200 ${
                    index === 0
                      ? "bg-gray-200 border border-gray-300"
                      : "bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-600">Smileys & People</h3>
              <span className="text-xs text-gray-400">523</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {smileysAndPeopleEmojis.slice(0, 32).map((emoji, index) => (
                <button
                  key={`smiley-${index}`}
                  className="h-14 w-full flex items-center justify-center text-2xl rounded-md hover:bg-gray-200 bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

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
