// src/components/SoundEffectPopup.jsx
import React, { useEffect } from "react";
import {
  XMarkIcon,
  SpeakerWaveIcon as SoundOnIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline"; // Giữ lại các icon cần thiết
import { motion, AnimatePresence } from "framer-motion";

const popupVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const SoundEffectPopup = ({
  isOpen,
  onClose,
  sounds = [],
  activeSound,
  onToggleSound,
}) => {
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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sound-popup-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md">
          <motion.div
            key="sound-popup-content"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-[var(--color-surface)] dark:bg-slate-800 rounded-xl shadow-2xl 
                       w-full max-w-lg md:max-w-xl lg:max-w-2xl 
                       p-6 sm:p-8 flex flex-col
                       text-[var(--color-text-primary)] dark:text-slate-100`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", height: "auto" }}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border)] dark:border-slate-700">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Hiệu Ứng Âm Thanh Nền
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-[var(--color-text-secondary)] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Đóng popup">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3 sm:space-y-4">
              {sounds.map((sound) => {
                const IconComponent = sound.icon; // Lấy component icon từ data
                const isCurrentlyActive =
                  activeSound && activeSound.id === sound.id;
                return (
                  <div
                    key={sound.id}
                    className={`p-3 sm:p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ease-in-out
                                border-2 
                                ${
                                  isCurrentlyActive
                                    ? "bg-indigo-100 dark:bg-indigo-700/50 border-indigo-500 dark:border-indigo-600 shadow-lg"
                                    : "bg-gray-50 dark:bg-slate-700/60 border-transparent hover:bg-gray-100 dark:hover:bg-slate-600/60 hover:border-slate-300 dark:hover:border-slate-500"
                                }`}
                    onClick={() => onToggleSound(sound)}>
                    <div className="flex items-center space-x-3">
                      {IconComponent && (
                        <IconComponent
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                            isCurrentlyActive
                              ? "text-indigo-600 dark:text-indigo-300"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                      )}
                      <span
                        className={`font-medium text-sm sm:text-base transition-colors ${
                          isCurrentlyActive
                            ? "text-indigo-700 dark:text-indigo-200"
                            : "text-[var(--color-text-primary)] dark:text-slate-200"
                        }`}>
                        {sound.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {sound.isPlus && (
                        <span className="px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                          PLUS
                        </span>
                      )}
                      <div className="w-6 h-6 sm:w-7 sm:h-7">
                        {isCurrentlyActive ? (
                          <SoundOnIcon className="w-full h-full text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        ) : (
                          <PlayCircleIcon className="w-full h-full text-slate-400 dark:text-slate-500 opacity-50 group-hover:opacity-100" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoundEffectPopup;
