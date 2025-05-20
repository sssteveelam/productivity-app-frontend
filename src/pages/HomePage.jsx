// src/pages/HomePage.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mainLogo from "../../public/icons/mainLogo.png"; // Logo của bạn

import MiniMusicPlayer from "../components/MiniMusicPlayer"; // THÊM IMPORT NÀY
import MusicSidebar from "../components/MusicSidebar";
import SoundEffectPopup from "../components/SoundEffectPopup";
import PomodoroTimer from "../components/PomodoroTimer";
import AmbientTimer from "../components/AmbientTimer";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  Cog6ToothIcon,
  SpeakerWaveIcon as ToolbarSpeakerWaveIcon,
  ChartBarIcon,
  ListBulletIcon,
  ArrowsPointingOutIcon,
  HomeIcon,
  LightBulbIcon,
  SparklesIcon,
  // ArrowRightOnRectangleIcon, // Icon này chưa được sử dụng trong JSX bạn cung cấp gần đây
  MoonIcon,
  SunIcon,
  MusicalNoteIcon,
  AdjustmentsHorizontalIcon,
  SpeakerXMarkIcon,
  CloudIcon,
  FireIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  XMarkIcon as CloseIcon,
} from "@heroicons/react/24/outline";

// --- CÀI ĐẶT CHO MUSIC ---
const MAX_FAVORITES = 5;
const LOCAL_STORAGE_FAVORITES_KEY = "flocusMusicFavorites_v1";

// --- DỮ LIỆU ÂM THANH NỀN ---
const ambientSoundsData = [
  {
    id: "rain",
    name: "Tiếng Mưa",
    icon: CloudIcon,
    audioSrc: "/sounds/ambient/light-rain.mp3",
    isPlus: false,
  },
  {
    id: "waves",
    name: "Sóng Biển",
    icon: ToolbarSpeakerWaveIcon,
    audioSrc: "/sounds/ambient/ocean-waves.mp3",
    isPlus: false,
  },
  {
    id: "campfire",
    name: "Lửa Trại",
    icon: FireIcon,
    audioSrc: "/sounds/ambient/campfire.mp3",
    isPlus: true,
  },
  {
    id: "cafe",
    name: "Quán Cafe",
    icon: BuildingStorefrontIcon,
    audioSrc: "/sounds/ambient/cafe.mp3",
    isPlus: false,
  },
  {
    id: "piano",
    name: "Piano",
    icon: MusicalNoteIcon,
    audioSrc: "/sounds/ambient/pianoo.mp3",
    isPlus: true,
  },
];

// Hàm tiện ích
const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getSpotifyEmbedUrl = (url) => {
  if (url.includes("open.spotify.com/playlist/")) {
    const playlistId = url.split("playlist/")[1]?.split("?")[0];
    return playlistId
      ? `https://open.spotify.com/embed/playlist/${playlistId}`
      : null;
  }
  if (url.includes("open.spotify.com/track/")) {
    const trackId = url.split("track/")[1]?.split("?")[0];
    return trackId ? `https://open.spotify.com/embed/track/${trackId}` : null;
  }
  if (url.includes("open.spotify.com/album/")) {
    const albumId = url.split("album/")[1]?.split("?")[0];
    return albumId ? `https://open.spotify.com/embed/album/${albumId}` : null;
  }
  // Thêm một check chung hơn cho link spotify track/playlist/album
  const spotifyRegex =
    /http:\/\/googleusercontent.com\/spotify.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/;
  const spotifyMatch = url.match(spotifyRegex);
  if (spotifyMatch && spotifyMatch[1] && spotifyMatch[2]) {
    return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
  }
  return null;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [pageMode, setPageMode] = useState("pomodoro");
  const [showFullPomodoro, setShowFullPomodoro] = useState(false);

  const [currentQuote, setCurrentQuote] = useState({
    text: "Difficult doesn't mean impossible. It simply means that you have to work hard.",
    author: "Unknown",
  });
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);
  const [focusPromptInput, setFocusPromptInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMusicSidebarOpen, setIsMusicSidebarOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState({
    type: null,
    src: null,
    name: null,
  });
  const [musicFavorites, setMusicFavorites] = useState([]);
  const [isLoadingMusicUrl, setIsLoadingMusicUrl] = useState(false);

  const [isSoundEffectPopupOpen, setIsSoundEffectPopupOpen] = useState(false);
  const [activeAmbientSound, setActiveAmbientSound] = useState(null);
  const audioRefs = useRef({});

  const setAudioRef = (soundId, element) => {
    audioRefs.current[soundId] = element;
  };

  const handleToggleAmbientSound = (soundToToggle) => {
    const soundId = soundToToggle.id;
    Object.keys(audioRefs.current).forEach((id) => {
      if (
        id !== soundId &&
        audioRefs.current[id] &&
        !audioRefs.current[id].paused
      ) {
        audioRefs.current[id].pause();
      }
    });
    const currentAudio = audioRefs.current[soundId];
    if (currentAudio) {
      if (activeAmbientSound && activeAmbientSound.id === soundId) {
        currentAudio.pause();
        setActiveAmbientSound(null);
        localStorage.removeItem("activeAmbientSoundState");
      } else {
        currentAudio.loop = true;
        currentAudio.volume = 0.3;
        currentAudio
          .play()
          .catch((e) => console.error("Lỗi phát âm thanh:", e));
        setActiveAmbientSound(soundToToggle);
        localStorage.setItem(
          "activeAmbientSoundState",
          JSON.stringify(soundToToggle)
        );
      }
    }
  };

  const stopActiveAmbientSound = () => {
    if (activeAmbientSound && audioRefs.current[activeAmbientSound.id]) {
      audioRefs.current[activeAmbientSound.id].pause();
      setActiveAmbientSound(null);
      localStorage.removeItem("activeAmbientSoundState");
    }
  };

  useEffect(() => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    if (storedFavorites) {
      try {
        setMusicFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_FAVORITES_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(musicFavorites)
    );
  }, [musicFavorites]);

  useEffect(() => {
    const savedStateString = localStorage.getItem("activeAmbientSoundState");
    if (savedStateString) {
      try {
        const savedSound = JSON.parse(savedStateString);
        const soundExists = ambientSoundsData.find(
          (s) => s.id === savedSound.id
        );
        if (soundExists) {
          setActiveAmbientSound(savedSound);
          setTimeout(() => {
            if (audioRefs.current[savedSound.id]) {
              audioRefs.current[savedSound.id].loop = true;
              audioRefs.current[savedSound.id].volume = 0.3;
              audioRefs.current[savedSound.id]
                .play()
                .catch((e) =>
                  console.warn("Autoplay ambient sound failed:", e)
                );
            }
          }, 500);
        } else {
          localStorage.removeItem("activeAmbientSoundState");
        }
      } catch (error) {
        localStorage.removeItem("activeAmbientSoundState");
      }
    }
  }, []);

  const processAndPlayMusicUrl = (urlToProcess, favoriteName = null) => {
    setIsLoadingMusicUrl(true);
    setCurrentPlayer({ type: "message", name: "Checking URL..." });
    const url = urlToProcess.trim();
    if (url === "") {
      setCurrentPlayer({ type: "message", name: "Please enter a URL." });
      setIsLoadingMusicUrl(false);
      return;
    }
    let embedUrl = null;
    let type = null;
    let name = favoriteName || url;
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&showinfo=0&loop=1&playlist=${youtubeId}`; // Thêm controls, showinfo, loop, playlist
      type = "youtube";
      if (!favoriteName) name = `YouTube Video`;
    } else {
      const spotifyEmbed = getSpotifyEmbedUrl(url);
      if (spotifyEmbed) {
        embedUrl = spotifyEmbed;
        type = "spotify";
        if (!favoriteName) name = `Spotify Content`;
      }
    }
    if (embedUrl && type) {
      setCurrentPlayer({ type, src: embedUrl, name });
    } else {
      setCurrentPlayer({
        type: "message",
        name: "URL not supported or invalid. Only YouTube and original Spotify links.",
      });
    }
    setIsLoadingMusicUrl(false);
  };

  const handleSaveMusicToFavorites = (
    urlToSaveFromSidebar,
    nameFromSidebar = "Custom Link"
  ) => {
    const urlToSave = urlToSaveFromSidebar.trim();
    if (!urlToSave) {
      alert("No URL to save.");
      return;
    }
    if (musicFavorites.some((fav) => fav.originalUrl === urlToSave)) {
      alert("Already in Favorites!");
      return;
    }
    if (musicFavorites.length >= MAX_FAVORITES) {
      alert(`Maximum ${MAX_FAVORITES} favorites allowed.`);
      return;
    }
    let nameForFavorite = nameFromSidebar;
    if (nameFromSidebar === "Custom Link") {
      if (getYouTubeVideoId(urlToSave))
        nameForFavorite = `YouTube: ${urlToSave.substring(0, 25)}...`;
      else if (urlToSave.includes("spotify.com"))
        nameForFavorite = `Spotify: ${urlToSave.substring(0, 25)}...`;
    }
    setMusicFavorites((prev) => [
      ...prev,
      { originalUrl: urlToSave, name: nameForFavorite },
    ]);
    alert(`Saved "${nameForFavorite}"!`);
  };

  const handleRemoveMusicFavorite = (urlToRemove) => {
    setMusicFavorites((prev) =>
      prev.filter((fav) => fav.originalUrl !== urlToRemove)
    );
  };

  const handleLoadSpotifyDefault = () => {
    const defaultSpotifyPlaylistUrl =
      "https://open.spotify.com/embed/playlist/$4"; // Ví dụ một playlist lofi
    processAndPlayMusicUrl(
      defaultSpotifyPlaylistUrl,
      "Lofi Focus Mix (Spotify)"
    );
  };

  const closeMusicPlayer = () => {
    setCurrentPlayer({ type: null, src: null, name: null });
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) navigate("/login");
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, [navigate]);

  const getGreetingMessage = (hour) => {
    if (hour >= 5 && hour < 12) return `Good morning!`;
    if (hour >= 12 && hour < 18)
      return `Good afternoon! Keep up the great work!`;
    if (hour >= 18 && hour < 22) return `Good evening! Time to wind down.`;
    return `Burning the midnight oil? Don't forget to rest!`;
  };
  const [greeting, setGreeting] = useState(() =>
    getGreetingMessage(new Date().getHours())
  );
  useEffect(() => {
    setGreeting(getGreetingMessage(currentTime.getHours()));
  }, [currentTime]);

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const response = await fetch("http://localhost:5001/api/quote/random");
        if (!response.ok)
          throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        if (data && data.q && data.a) {
          setCurrentQuote({ text: data.q, author: data.a });
        } else {
          setCurrentQuote({
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker",
          });
        }
      } catch (error) {
        console.error("Cannot load quote:", error);
        setQuoteError("Cannot load quote at the moment.");
        setCurrentQuote({
          text: "The best way to predict the future is to create it.",
          author: "Peter Drucker",
        });
      } finally {
        setQuoteLoading(false);
      }
    };
    fetchQuote();
    const quoteIntervalId = setInterval(fetchQuote, 30 * 60 * 1000); // Fetch new quote every 30 minutes
    return () => clearInterval(quoteIntervalId);
  }, []);

  const togglePageMode = (targetMode) => {
    setPageMode(targetMode);
    if (targetMode === "pomodoro") {
      setShowFullPomodoro(false);
    }
  };

  const ambientBgImage = "/images/bgimg.png";

  const formatLargeDisplayTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleLargeClockClick = () => setShowFullPomodoro(true);

  // Hàm processAndPlayMusicUrl, handleSaveMusicToFavorites, etc. vẫn nằm ở HomePage
  const handleOpenMusicSidebar = () => {
    setIsMusicSidebarOpen(true);
    // Không cần ẩn MiniPlayer ở đây, vì logic render sẽ xử lý
  };

  const handleCloseMusicSidebar = () => {
    setIsMusicSidebarOpen(false);
    // Khi đóng sidebar, nếu có nhạc đang phát, MiniPlayer sẽ tự động hiển thị (do logic render)
  };

  const closeMusicPlayerAndSidebar = () => {
    setCurrentPlayer({ type: null, src: null, name: null }); // Dừng nhạc hoàn toàn
    setIsMusicSidebarOpen(false); // Đóng cả sidebar nếu đang mở
  };

  const utilityButtons = [
    {
      title: "Stats",
      icon: ChartBarIcon,
      action: () => alert("Stats (Coming Soon!)"),
    },
    {
      title: "Ambient Sounds",
      icon: ToolbarSpeakerWaveIcon,
      action: () => setIsSoundEffectPopupOpen(true),
    },
    {
      title: "App Settings",
      icon: Cog6ToothIcon,
      action: () => alert("App Settings (Coming Soon!)"),
    },
    {
      title: "To-Do List",
      icon: ListBulletIcon,
      action: () => navigate("/todo"),
    },
    {
      title: "Fullscreen",
      icon: ArrowsPointingOutIcon,
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            alert(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            );
          });
        } else {
          document.exitFullscreen();
        }
      },
      disabled: false,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-all duration-500 ease-in-out
                  ${theme === "dark" ? "dark" : ""} 
                  ${
                    pageMode === "pomodoro"
                      ? "bg-[var(--gradient-start)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] justify-between p-4 sm:p-6"
                      : "justify-start text-white" // Ambient mode text color
                  }`}
      style={
        pageMode === "ambient"
          ? {
              backgroundImage: `url(${ambientBgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundAttachment: "fixed",
            }
          : {
              backgroundImage: `linear-gradient(to bottom right, var(--gradient-start), var(--gradient-via), var(--gradient-end))`,
              backgroundAttachment: "fixed",
            }
      }>
      {ambientSoundsData.map((sound) => (
        <audio
          key={sound.id}
          ref={(el) => setAudioRef(sound.id, el)}
          src={sound.audioSrc}
          loop
          preload="auto"
          style={{ display: "none" }}
        />
      ))}

      {pageMode === "pomodoro" && (
        <header className="w-full flex justify-between items-center z-10 mb-4 md:mb-8 pt-2 sm:pt-3 px-2">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => {
              setShowFullPomodoro(false);
              if (pageMode !== "pomodoro") setPageMode("pomodoro");
              // else navigate("/"); // Navigate to home "/" only if already on pomodoro and clock view
            }}>
            <img
              src={mainLogo}
              alt="FocusApp Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg group-hover:opacity-80 transition-opacity"
            />
            <span className="text-xl sm:text-2xl font-bold text-[var(--color-brand-pink-default)] dark:text-[var(--color-brand-pink-dark-tone)] group-hover:opacity-80 transition-opacity">
              FocusApp
            </span>
          </div>
          <div className="text-right max-w-[40%] sm:max-w-[35%] md:max-w-[400px] text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] opacity-80 hover:opacity-100 transition-opacity">
            {quoteLoading && (
              <p className="text-xs italic animate-pulse">Loading quote...</p>
            )}
            {quoteError && !quoteLoading && (
              <p className="text-xs italic text-amber-600 dark:text-amber-500">
                {quoteError}
              </p>
            )}
            {!quoteLoading && !quoteError && currentQuote.text && (
              <>
                <p className="text-xs sm:text-sm italic leading-tight">
                  "{currentQuote.text}"
                </p>
                {currentQuote.author && (
                  <p className="text-xxs sm:text-xs font-medium mt-0.5 opacity-70">
                    - {currentQuote.author}
                  </p>
                )}
              </>
            )}
          </div>
        </header>
      )}

      {pageMode === "pomodoro" && (
        <main className="flex-grow flex flex-col items-center justify-center text-center w-full z-0 -mt-12 sm:-mt-16 md:-mt-20 px-4">
          {!showFullPomodoro ? (
            <>
              <div
                className="text-[clamp(5rem,28vw,10rem)] sm:text-[clamp(6rem,33vw,14rem)] lg:text-[clamp(7rem,30vw,16rem)] font-mono font-bold text-[var(--color-text-primary)] dark:text-slate-100 cursor-pointer transition-transform hover:scale-105"
                onClick={handleLargeClockClick}
                title="Click to start a Pomodoro session">
                {formatLargeDisplayTime(currentTime)}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-slate-300 mt-1 sm:mt-2">
                {greeting}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]/70 dark:text-slate-400 mt-1">
                Click the time to begin your focus session.
              </p>
            </>
          ) : (
            <div className="w-full max-w-md mt-4 sm:mt-0">
              {" "}
              {/* Container cho PomodoroTimer */}
              <PomodoroTimer
                focusTaskName={focusPromptInput || null}
                onClosePomodoro={() => setShowFullPomodoro(false)}
              />
            </div>
          )}
        </main>
      )}

      <AnimatePresence>
        {pageMode === "ambient" && (
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
            <AmbientTimer key="ambient-timer" />
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-4 sm:bottom-6 w-full px-4 sm:px-6 z-40 flex justify-between items-end pointer-events-none">
        <div className="flex items-center bg-black/30 dark:bg-slate-800/60 backdrop-blur-md rounded-full shadow-xl p-1.5 sm:p-2 space-x-1 sm:space-x-2 pointer-events-auto">
          {/* NÚT ÂM NHẠC (MUSIC) */}
          {/* Nút này sẽ luôn mở sidebar, việc hiển thị tên nhạc/đóng sẽ do MiniPlayer hoặc nút trong sidebar đảm nhiệm */}
          <button
            title="Mở Âm nhạc"
            onClick={handleOpenMusicSidebar} // Luôn mở sidebar
            className={`p-2 sm:p-2.5 text-white/80 hover:text-white rounded-full transition-colors
                        ${
                          currentPlayer.type &&
                          currentPlayer.type !== "message" &&
                          currentPlayer.src
                            ? "hover:bg-purple-500/30 dark:hover:bg-purple-600/50 bg-purple-500/20 dark:bg-purple-600/40" // Highlight nếu có nhạc đang chạy
                            : "hover:bg-white/10 dark:hover:bg-slate-700"
                        }`}>
            <MusicalNoteIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {activeAmbientSound ? (
            <div className="flex items-center bg-sky-500/30 dark:bg-sky-600/50 rounded-full pl-2.5 pr-1 py-1 sm:pl-3 sm:pr-1.5 sm:py-1.5 space-x-1 sm:space-x-1.5 transition-all duration-300">
              <button
                onClick={() => setIsSoundEffectPopupOpen(true)}
                className="flex items-center space-x-1.5 group">
                <ToolbarSpeakerWaveIcon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors flex-shrink-0" />
                <span
                  className="text-xs sm:text-sm text-white/90 truncate max-w-[50px] sm:max-w-[70px] font-medium cursor-pointer group-hover:underline"
                  title={activeAmbientSound.name}>
                  {activeAmbientSound.name}
                </span>
              </button>
              <button
                title={`Stop ${activeAmbientSound.name}`}
                onClick={stopActiveAmbientSound}
                className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 dark:hover:bg-black/20 transition-colors">
                <SpeakerXMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <button
              title="Open Ambient Sounds"
              onClick={() => setIsSoundEffectPopupOpen(true)}
              className="p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700 rounded-full transition-colors">
              <AdjustmentsHorizontalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center bg-black/30 dark:bg-slate-800/60 backdrop-blur-md rounded-full shadow-xl p-1.5 sm:p-2 space-x-0.5 sm:space-x-1 pointer-events-auto">
          <button
            title={
              pageMode === "pomodoro"
                ? "Relax Mode (Ambient)"
                : "Focus Mode (Pomodoro)"
            }
            onClick={() =>
              togglePageMode(pageMode === "pomodoro" ? "ambient" : "pomodoro")
            }
            className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 ${
              pageMode === "ambient"
                ? "bg-white/20 text-pink-300 dark:text-pink-400"
                : "text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700"
            }`}>
            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            title="Pomodoro Home Screen"
            onClick={() => {
              togglePageMode("pomodoro");
              setShowFullPomodoro(false);
            }}
            className={`p-2.5 sm:p-3 text-white rounded-full shadow-md transition-colors ${
              pageMode === "pomodoro" && !showFullPomodoro
                ? "bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700"
                : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
            }`}>
            <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            title="Ideas (Coming Soon!)"
            className="p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700 rounded-full transition-colors">
            <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col space-y-2 bg-black/30 dark:bg-slate-800/60 backdrop-blur-md rounded-full shadow-xl p-2.5 sm:p-3 pointer-events-auto">
          {utilityButtons.map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              onClick={btn.action}
              disabled={btn.disabled}
              className={`p-2 rounded-full transition-colors ${
                btn.disabled
                  ? "text-white/40 cursor-not-allowed"
                  : "text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700"
              }`}>
              <btn.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ))}
          <button
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700 transition-colors">
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </footer>

      {/* Music Sidebar sẽ hiển thị trình phát đầy đủ BÊN TRONG nó */}
      <MusicSidebar
        isOpen={isMusicSidebarOpen}
        onClose={handleCloseMusicSidebar} // Dùng hàm đóng mới
        currentPlayer={currentPlayer} // Truyền currentPlayer xuống
        favorites={musicFavorites}
        onLoadCustomUrl={processAndPlayMusicUrl}
        onSaveToFavorites={handleSaveMusicToFavorites}
        onLoadFavorite={(originalUrl, name) =>
          processAndPlayMusicUrl(originalUrl, name)
        }
        onRemoveFavorite={handleRemoveMusicFavorite}
        onLoadSpotifyDefault={handleLoadSpotifyDefault}
        isLoadingUrl={isLoadingMusicUrl}
        onClosePlayer={closeMusicPlayerAndSidebar} // Sidebar có thể gọi hàm này để đóng cả player và sidebar
      />
      <SoundEffectPopup
        isOpen={isSoundEffectPopupOpen}
        onClose={() => setIsSoundEffectPopupOpen(false)}
        sounds={ambientSoundsData}
        activeSound={activeAmbientSound}
        onToggleSound={handleToggleAmbientSound}
      />
      {/* MINI MUSIC PLAYER: Hiển thị khi sidebar đóng VÀ có nhạc đang phát */}
      <AnimatePresence>
        {!isMusicSidebarOpen &&
          currentPlayer.type &&
          currentPlayer.type !== "message" &&
          currentPlayer.src && (
            <MiniMusicPlayer
              playerInfo={currentPlayer}
              onClose={closeMusicPlayerAndSidebar} // Nút X trên mini player sẽ đóng nhạc
            />
          )}
      </AnimatePresence>
    </div>
  );
}
