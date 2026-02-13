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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center ">
        <button
          onClick={login}
          className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:shadow-lg"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1>Welcome {user.email}</h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white p-2 mt-4 rounded cursor-pointer"
      >
        Logout
      </button>

      <div className="mt-6">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={addBookmark}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="mt-6">
        {bookmarks.map((b) => (
          <div key={b.id} className="border p-3 mt-2 flex justify-between">
            <div>
              <p>{b.title}</p>
              <a href={b.url} target="_blank" className="text-blue-500">
                {b.url}
              </a>
            </div>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
