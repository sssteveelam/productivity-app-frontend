// src/components/MiniMusicPlayer.jsx
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const playerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const MiniMusicPlayer = ({ playerInfo, onClose }) => {
  if (!playerInfo || !playerInfo.src || playerInfo.type === "message") {
    return null;
  }

  return (
    <motion.div
      key="mini-music-player"
      variants={playerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed bottom-[calc(3.5rem+1rem)] left-4 sm:left-6 z-30 
                 w-[280px] sm:w-[320px] 
                 bg-slate-800/90 dark:bg-black/80 backdrop-blur-lg 
                 rounded-xl shadow-2xl overflow-hidden
                 border border-slate-700 dark:border-slate-600"
      drag // Cho phép kéo thả (tùy chọn)
      dragConstraints={{ top: -200, left: -50, right: 200, bottom: 50 }} // Giới hạn vùng kéo
    >
      <div className="p-2 flex justify-between items-center bg-slate-700/50 dark:bg-black/30 cursor-move">
        <p
          className="text-xs text-white/80 truncate ml-1 w-full font-medium"
          title={playerInfo.name}>
          {playerInfo.name || "Music Player"}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện drag khi click nút đóng
            onClose();
          }}
          className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 dark:hover:bg-black/20 transition-colors flex-shrink-0"
          title="Close Player">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="aspect-video">
        {" "}
        {/* Giữ tỷ lệ khung hình video */}
        {(playerInfo.type === "youtube" || playerInfo.type === "spotify") && (
          <iframe
            width="100%"
            height="100%"
            src={playerInfo.src} // URL nhúng
            title={playerInfo.name || "Music Player"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"></iframe>
        )}
      </div>
    </motion.div>
  );
};

export default MiniMusicPlayer;
