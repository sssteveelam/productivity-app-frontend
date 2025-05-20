// src/components/MusicSidebar.jsx
import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  HeartIcon as HeartOutlineIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FAVORITES = 5;

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0.5 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } },
};

const MusicSidebar = ({
  isOpen,
  onClose,
  currentPlayer, // Nhận từ HomePage
  favorites = [],
  onLoadCustomUrl,
  onSaveToFavorites,
  onLoadFavorite,
  onRemoveFavorite,
  onLoadSpotifyDefault,
  isLoadingUrl,
  onClosePlayer, // Nhận từ HomePage
}) => {
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

  const handleLoadClicked = () => {
    if (customPlaylistUrl.trim() === "") {
      // Thông báo lỗi có thể được xử lý ở HomePage thông qua currentPlayer
      onLoadCustomUrl("", null);
      return;
    }
    onLoadCustomUrl(customPlaylistUrl, null);
  };

  const handleSaveClicked = () => {
    const urlToConsiderForSave =
      customPlaylistUrl.trim() ||
      (currentPlayer?.type !== "message" && currentPlayer?.src
        ? currentPlayer.originalUrl || currentPlayer.src
        : "");
    if (!urlToConsiderForSave) {
      // Có thể hiển thị thông báo lỗi tinh tế hơn ở đây thay vì alert
      // Ví dụ: set một state lỗi nội bộ cho sidebar
      alert("Please load or enter a valid URL to save.");
      return;
    }
    onSaveToFavorites(urlToConsiderForSave); // HomePage sẽ tạo tên
  };

  const isUrlFavorite = (urlToCheck) => {
    if (!urlToCheck || !favorites) return false;
    return favorites.some((fav) => fav.originalUrl === urlToCheck);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="music-sidebar-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-40"
          />

          <motion.aside
            key="music-sidebar-content"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-0 left-0 w-72 sm:w-80 md:w-[360px] h-full 
                       bg-[var(--color-surface)] dark:bg-slate-800 
                       shadow-2xl z-50 flex flex-col
                       text-[var(--color-text-primary)] dark:text-slate-100`}>
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[var(--color-border)] dark:border-slate-700 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-semibold">Music</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[var(--color-text-secondary)] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 ring-inset focus:ring-indigo-500"
                aria-label="Đóng sidebar âm nhạc">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow p-4 sm:p-5 overflow-y-auto space-y-6">
              {/* KHU VỰC HIỂN THỊ TRÌNH PHÁT NHẠC KHI SIDEBAR MỞ */}
              {currentPlayer &&
                currentPlayer.type &&
                currentPlayer.type !== "message" &&
                currentPlayer.src && (
                  <section className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4
                        className="text-md font-semibold text-[var(--color-text-primary)] dark:text-slate-200 truncate"
                        title={currentPlayer.name}>
                        Now Playing:{" "}
                        <em className="font-normal opacity-80">
                          {currentPlayer.name}
                        </em>
                      </h4>
                      <button
                        onClick={onClosePlayer} // Nút X này sẽ gọi hàm từ HomePage để đóng player
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Close Player">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                      {(currentPlayer.type === "youtube" ||
                        currentPlayer.type === "spotify") && (
                        <iframe
                          width="100%"
                          height="100%"
                          src={currentPlayer.src}
                          title={currentPlayer.name || "Music Player"}
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"></iframe>
                      )}
                    </div>
                  </section>
                )}
              {currentPlayer &&
                currentPlayer.type === "message" &&
                currentPlayer.name && (
                  <p
                    className={`p-3 rounded-md text-sm mb-4 ${
                      currentPlayer.name.includes("không hỗ trợ") ||
                      currentPlayer.name.includes("Vui lòng")
                        ? "bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300"
                        : "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                    }`}>
                    {currentPlayer.name}
                  </p>
                )}

              {/* Phần Custom Playlists */}
              <section aria-labelledby="custom-playlists-heading">
                <div className="flex items-center mb-2">
                  <h3
                    id="custom-playlists-heading"
                    className="text-lg font-semibold">
                    Custom Playlists
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/30 rounded-full">
                    👑 PLUS
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-slate-400 mb-4">
                  Add YouTube or Spotify URLs. Save up to {MAX_FAVORITES}{" "}
                  favorites.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customPlaylistUrl}
                    onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                    placeholder="Paste YouTube or Spotify URL here"
                    className="w-full px-4 py-2.5 border border-[var(--color-border)] dark:border-slate-600 rounded-lg shadow-sm 
                               bg-white dark:bg-slate-700 
                               text-[var(--color-text-primary)] dark:text-slate-100
                               placeholder-[var(--color-text-secondary)] dark:placeholder-slate-400
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleLoadClicked}
                      disabled={isLoadingUrl || !customPlaylistUrl.trim()}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoadingUrl && customPlaylistUrl.trim() !== ""
                        ? "Loading..."
                        : "Load"}
                    </button>
                    <button
                      onClick={handleSaveClicked}
                      disabled={
                        isLoadingUrl ||
                        (!customPlaylistUrl.trim() &&
                          !(
                            currentPlayer.type !== "message" &&
                            currentPlayer.src
                          ))
                      } // Disable nếu cả input và player đều rỗng
                      className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-purple-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                      {isUrlFavorite(customPlaylistUrl.trim()) ? (
                        <HeartSolidIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      ) : (
                        <HeartOutlineIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      )}
                      Favorite
                    </button>
                  </div>
                </div>
              </section>

              <hr className="border-[var(--color-border)] dark:border-slate-700/50 my-6" />

              {/* Phần Favorites */}
              {favorites && favorites.length > 0 && (
                <section aria-labelledby="favorites-heading">
                  <h3
                    id="favorites-heading"
                    className="text-lg font-semibold mb-3">
                    My Favorites{" "}
                    <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                      ({favorites.length}/{MAX_FAVORITES})
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 -mr-1">
                    {" "}
                    {/* Thêm -mr-1 để scrollbar không chiếm chỗ của nút X */}
                    {favorites.map((fav, index) => (
                      <div
                        key={fav.originalUrl || index}
                        className="p-2.5 bg-gray-100 dark:bg-slate-700/80 rounded-md flex justify-between items-center group">
                        <div
                          className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer group/load"
                          onClick={() =>
                            onLoadFavorite(fav.originalUrl, fav.name)
                          }
                          title={`Load: ${fav.name}`}>
                          <PlayCircleIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 group-hover/load:text-indigo-600 dark:group-hover/load:text-indigo-300 transition-colors" />
                          <span className="text-sm text-[var(--color-text-primary)] dark:text-slate-200 truncate group-hover/load:text-indigo-600 dark:group-hover/load:text-indigo-300 transition-colors">
                            {fav.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveFavorite(fav.originalUrl)}
                          title="Remove from favorites"
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-50 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {favorites && favorites.length === 0 && (
                <p className="text-sm text-center text-[var(--color-text-secondary)] dark:text-slate-400">
                  Your favorite playlists will appear here.
                </p>
              )}

              <hr className="border-[var(--color-border)] dark:border-slate-700/50 my-6" />

              <section aria-labelledby="builtin-player-heading">
                <h3
                  id="builtin-player-heading"
                  className="text-lg font-semibold mb-2">
                  Built-in Player
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-slate-400 mb-3">
                  Select a default playlist from{" "}
                  <button
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                    onClick={() => alert("Music Settings (Sắp có!)")}>
                    Music settings
                  </button>
                  .
                </p>
                <button
                  onClick={onLoadSpotifyDefault}
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-green-500 transition duration-150">
                  Load Lofi Radio (Spotify)
                </button>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicSidebar;
