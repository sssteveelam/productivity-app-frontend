// src/components/MusicSidebar.jsx
import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion"; // Import motion và AnimatePresence

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 }, // Trạng thái ban đầu (ẩn bên trái)
  visible: { x: 0, opacity: 1 }, // Trạng thái khi hiển thị
  exit: { x: "-100%", opacity: 0 }, // Trạng thái khi đóng
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const MusicSidebar = ({ isOpen, onClose }) => {
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLoadCustomPlaylist = () => {
    if (customPlaylistUrl.trim() === "") {
      alert("Vui lòng dán URL playlist vào.");
      return;
    }
    alert(
      `Đang tải playlist: ${customPlaylistUrl} (Chức năng này sẽ được phát triển sau)`
    );
  };

  const handleSaveToFavorites = () => {
    if (customPlaylistUrl.trim() === "") {
      alert("Vui lòng dán URL playlist trước khi lưu.");
      return;
    }
    alert(
      `Đã lưu playlist vào Favorites: ${customPlaylistUrl} (Chức năng này sẽ được phát triển sau)`
    );
    // TODO: Logic lưu vào localStorage hoặc backend (nếu có user)
  };

  const handleLoadSpotifyPlayer = () => {
    alert("Tải trình phát Spotify (Chức năng này sẽ được phát triển sau)");
    // TODO: Logic nhúng Spotify Web Playback SDK hoặc iframe
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="music-sidebar-overlay" // Key cần thiết cho AnimatePresence
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          <motion.aside
            key="music-sidebar-content" // Key cần thiết
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }} // Điều chỉnh duration và ease theo ý muốn
            className={`fixed top-0 left-0 w-72 sm:w-80 h-full bg-[var(--color-surface)] dark:bg-slate-800
                       shadow-2xl z-50 flex flex-col`} // Bỏ các class transform và transition của Tailwind
          >
            {/* Header của Sidebar */}
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)] dark:border-slate-700">
              <h2 className="text-xl font-semibold">Music</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-[var(--color-text-secondary)] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Đóng sidebar âm nhạc">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Nội dung chính của Sidebar */}
            <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-8">
              {/* Phần Custom Playlists */}
              <section>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-slate-100">
                    Custom Playlists
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                    👑 PLUS
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-slate-400 mb-3">
                  Add your favorite playlists from Spotify, YouTube, Apple
                  Music, SoundCloud, or Amazon Music. Store up to 5 to
                  favorites.
                </p>
                <input
                  type="text"
                  value={customPlaylistUrl}
                  onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                  placeholder="Paste playlist or video URL here"
                  className="w-full px-3 py-2.5 mb-3 border border-[var(--color-border)] dark:border-slate-600 rounded-lg shadow-sm 
                             bg-white dark:bg-slate-700 
                             text-[var(--color-text-primary)] dark:text-slate-100
                             placeholder-[var(--color-text-secondary)] dark:placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleLoadCustomPlaylist}
                    className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 transition duration-150">
                    Load
                  </button>
                  <button
                    onClick={handleSaveToFavorites}
                    className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-purple-500 transition duration-150">
                    Save to Favorites
                  </button>
                </div>
              </section>

              {/* Đường kẻ ngang phân cách */}
              <hr className="border-gray-200 dark:border-slate-700 my-6" />

              {/* Phần Flocus Playlists (hoặc Built-in Playlists) */}
              <section>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-slate-400 mb-3">
                  To play any of our built-in playlists, select it in{" "}
                  <strong
                    className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline"
                    onClick={() =>
                      alert("Chuyển đến Music Settings (Sắp có!)")
                    }>
                    Music settings
                  </strong>
                  .
                </p>
                <button
                  onClick={handleLoadSpotifyPlayer}
                  className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-green-500 transition duration-150">
                  Load Spotify Player
                </button>
                {/* TODO: Hiển thị danh sách Flocus Playlists ở đây (dạng card) */}
                <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                  (Built-in playlists will appear here or in settings)
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicSidebar;
