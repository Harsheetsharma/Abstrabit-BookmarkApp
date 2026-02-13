"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchBookmarks();
    checkUser();
    const channel = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => fetchBookmarks(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const addBookmark = async () => {
    if (!user) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");

    fetchBookmarks();
  };

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setBookmarks(data || []);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 🌟 LOGIN SCREEN
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Welcome to Smart Bookmark
        </h1>
        <p className="text-gray-700 mb-8 text-center max-w-md">
          Save, manage, and access your favorite links quickly. Log in with
          Google to start organizing your bookmarks.
        </p>
        <button
          onClick={login}
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">
            Welcome, {user.user_metadata?.full_name || user.email}
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-200"
          >
            Logout
          </button>
        </header>

        {/* Add Bookmark */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={addBookmark}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
          >
            Add Bookmark
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks yet. Add some above!
            </p>
          )}
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition duration-200"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {b.title}
                </p>
                <a
                  href={b.url}
                  target="_blank"
                  className="text-blue-500 hover:underline truncate max-w-sm"
                >
                  {b.url}
                </a>
              </div>
              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
