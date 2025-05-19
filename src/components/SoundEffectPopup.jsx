// src/components/SoundEffectPopup.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  PlayIcon,
  SpeakerWaveIcon,
  CloudIcon,
  FireIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline"; // Thêm các icon cho từng loại âm thanh

import { motion, AnimatePresence } from "framer-motion"; // Import

const popupVariants = {
  hidden: { scale: 0.95, opacity: 0 }, // Trạng thái ban đầu (hơi nhỏ và mờ)
  visible: { scale: 1, opacity: 1 }, // Trạng thái khi hiển thị
  exit: { scale: 0.95, opacity: 0 }, // Trạng thái khi đóng
};

const overlayVariants = {
  // Có thể dùng lại từ MusicSidebar nếu muốn đồng nhất
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Danh sách các hiệu ứng âm thanh mẫu
const ambientSounds = [
  {
    id: "rain",
    name: "Tiếng Mưa Nhẹ",
    icon: CloudIcon,
    audioSrc: "../../public/sounds/ambient/light-rain.mp3",
    isPlus: false,
  },
  {
    id: "waves",
    name: "Sóng Biển Vỗ Về",
    icon: SpeakerWaveIcon,
    audioSrc: "../../public/sounds/sounds/ambient/ocean-waves.mp3",
    isPlus: false,
  },
  {
    id: "campfire",
    name: "Lửa Trại Bập Bùng",
    icon: FireIcon,
    audioSrc: "../../public/sounds/sounds/ambient/campfire.mp3",
    isPlus: true,
  },
  {
    id: "cafe",
    name: "Quán Cafe Ven Đường",
    icon: BuildingStorefrontIcon,
    audioSrc: "../../public/sounds/sounds/ambient/cafe.mp3",
    isPlus: false,
  },
  {
    id: "library",
    name: "Piano",
    icon: BookOpenIcon,
    audioSrc: "../../public/sounds/sounds/ambient/piano.mp3",
    isPlus: true,
  },
  // Thêm các âm thanh khác nếu có
];

const SoundEffectPopup = ({ isOpen, onClose }) => {
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
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      // Chỉ lắng nghe khi popup được dự định là mở
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // State để quản lý âm thanh nào đang được chọn/phát (ví dụ: chỉ cho phép 1 âm thanh phát tại một thời điểm)
  const [activeSoundId, setActiveSoundId] = useState(null);
  // State cho âm lượng của từng âm thanh (phức tạp hơn, sẽ làm sau)
  // const [soundVolumes, setSoundVolumes] = useState({});

  // Refs cho các thẻ audio
  const audioRefs = useRef({});

  const handlePlaySound = (sound) => {
    // Dừng âm thanh đang phát (nếu có và khác âm thanh mới)
    if (
      activeSoundId &&
      activeSoundId !== sound.id &&
      audioRefs.current[activeSoundId]
    ) {
      audioRefs.current[activeSoundId].pause();
      audioRefs.current[activeSoundId].currentTime = 0; // Reset về đầu
    }

    const currentAudio = audioRefs.current[sound.id];

    if (currentAudio) {
      if (activeSoundId === sound.id) {
        // Nếu click lại vào âm thanh đang phát -> Tắt nó đi
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setActiveSoundId(null);
        // TODO: Lưu trạng thái tắt vào localStorage
      } else {
        // Phát âm thanh mới
        currentAudio.loop = true; // Cho phép lặp lại
        currentAudio.volume = 0.5; // Đặt âm lượng mặc định (ví dụ 50%)
        currentAudio
          .play()
          .catch((e) => console.error("Lỗi phát âm thanh:", e));
        setActiveSoundId(sound.id);
        // TODO: Lưu trạng thái đang phát và âm lượng vào localStorage
      }
    }
  };

  // Load trạng thái âm thanh từ localStorage khi component mount
  useEffect(() => {
    const savedActiveSoundId = localStorage.getItem("activeAmbientSoundId");

    if (
      savedActiveSoundId &&
      ambientSounds.find((s) => s.id === savedActiveSoundId)
    ) {
      // Nếu có âm thanh đã lưu và nó tồn tại trong danh sách, thử phát lại
      const soundToPlay = ambientSounds.find(
        (s) => s.id === savedActiveSoundId
      );

      // Không tự động phát khi load lại để tránh làm phiền, chỉ set active
      setActiveSoundId(soundToPlay.id);
      // Nếu muốn tự động phát:
      // setTimeout(() => { // Đợi audioRefs được tạo
      //    if (audioRefs.current[soundToPlay.id]) {
      //        handlePlaySound(soundToPlay);
      //    }
      // }, 100);
    }
  }, []);

  // Lưu trạng thái âm thanh vào localStorage khi activeSoundId thay đổi
  useEffect(() => {
    if (activeSoundId) {
      localStorage.setItem("activeAmbientSoundId", activeSoundId);
    } else {
      localStorage.removeItem("activeAmbientSoundId");
    }
  }, [activeSoundId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sound-popup-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }} // Overlay có thể nhanh hơn một chút
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <motion.div
            key="sound-popup-content"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }} // Duration cho popup
            className={`bg-[var(--color-surface)] dark:bg-slate-800 rounded-xl shadow-2xl 
                       w-full max-w-lg p-6 sm:p-8 
                       flex flex-col`} // Bỏ transform và transition của Tailwind
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "80vh" }}>
            {/* Header của Popup */}
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

            {/* Nội dung chính của Popup: Danh sách các âm thanh */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3 sm:space-y-4">
              {/* Thêm -mr-2 và pr-2 để che scrollbar nếu cần */}
              {/* TODO: Thêm bộ lọc thể loại âm thanh ở đây */}
              {ambientSounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`p-3 sm:p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ease-in-out
                              border 
                              ${
                                activeSoundId === sound.id
                                  ? "bg-indigo-100 dark:bg-indigo-700/40 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-600"
                                  : "bg-gray-50 dark:bg-slate-700/40 border-transparent hover:bg-gray-100 dark:hover:bg-slate-600/50 hover:shadow-md"
                              }`}
                  onClick={() => handlePlaySound(sound)}>
                  <div className="flex items-center space-x-3">
                    <sound.icon
                      className={`w-6 h-6 sm:w-7 sm:h-7 ${
                        activeSoundId === sound.id
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    <span
                      className={`font-medium text-sm sm:text-base ${
                        activeSoundId === sound.id
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
                    {/* Thẻ audio ẩn cho mỗi âm thanh */}
                    <audio
                      ref={(el) => (audioRefs.current[sound.id] = el)}
                      src={sound.audioSrc}
                      loop // Cho phép lặp lại âm thanh nền
                      preload="auto"
                    />
                    {/* Nút Play/Pause riêng cho từng âm thanh (nếu muốn điều khiển chi tiết hơn)
                        Hoặc chỉ cần một trạng thái active chung như hiện tại
                    */}
                    {activeSoundId === sound.id && (
                      <SpeakerWaveIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoundEffectPopup;
