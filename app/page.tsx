'use client';

import { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';

interface Radio {
  id: number;
  title: string;
  imgUrl: string;
  desc?: string;
  clout?: number;
  playcount?: number;
  podcaster?: {
    username: string;
  };
}

interface Region {
  title: string;
  radios: Radio[];
}

type RadioData = {
  [key: string]: Region;
};

function getMp3Url(id: number): string {
  const streamPath = `/live/${id}/64k.mp3`;
  const ts = (Math.floor(Date.now() / 1000) + 3600).toString(16);
  const params = `app_id=web&path=${encodeURIComponent(streamPath)}&ts=${encodeURIComponent(ts)}`;

  const sign = CryptoJS.HmacMD5(params, 'Lwrpu$K5oP').toString();

  return `https://lhttp.qingting.fm/live/${id}/64k.mp3?app_id=web&ts=${ts}&sign=${sign}`;
}

export default function Home() {
  const [radioData, setRadioData] = useState<RadioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch data from Cloudflare Worker
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://crimson-poetry-6661.fireliuping.workers.dev/');
        if (!response.ok) {
          throw new Error('Failed to fetch radio data');
        }
        const data = await response.json();
        setRadioData(data);

        // Set first region as default
        const firstRegionId = Object.keys(data)[0];
        if (firstRegionId) {
          setSelectedRegion(firstRegionId);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching radio data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const regions = radioData ? Object.entries(radioData) : [];

  const handlePlayRadio = (radio: Radio) => {
    if (selectedRadio?.id === radio.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setSelectedRadio(radio);
      setIsPlaying(true);
      if (audioRef.current) {
        const url = getMp3Url(radio.id);
        audioRef.current.src = url;
        audioRef.current.play().catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
        });
      }
    }
  };

  const filteredRadios = selectedRegion && radioData
    ? radioData[selectedRegion].radios.filter((radio) =>
        radio.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">加载电台数据中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">加载失败</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">📻</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                中国广播电台
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                实时收听全国各地广播电台 · {regions.length} 个地区 · {Object.values(radioData || {}).reduce((acc, r) => acc + r.radios.length, 0)} 个电台
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 搜索电台名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        {/* Region Selector */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {regions.map(([id, region]) => (
              <button
                key={id}
                onClick={() => setSelectedRegion(id)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-semibold transition-all transform hover:scale-105 shadow-md ${
                  selectedRegion === id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:bg-gray-600'
                }`}
              >
                {region.title}
                <span className="ml-2 text-xs opacity-75">({region.radios.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Radio Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRadios.map((radio) => (
            <div
              key={radio.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="relative group">
                <img
                  src={`https:${radio.imgUrl}`}
                  alt={radio.title}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Radio';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {selectedRadio?.id === radio.id && isPlaying && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                    🔴 LIVE
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate">
                  {radio.title}
                </h3>
                {radio.desc && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 h-10">
                    {radio.desc}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 mb-4">
                  {radio.playcount && (
                    <span className="flex items-center gap-1">
                      ▶ {(radio.playcount / 10000).toFixed(1)}万
                    </span>
                  )}
                  {radio.podcaster && (
                    <span className="flex items-center gap-1 truncate">
                      👤 {radio.podcaster.username}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handlePlayRadio(radio)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 ${
                    selectedRadio?.id === radio.id && isPlaying
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50'
                  }`}
                >
                  {selectedRadio?.id === radio.id && isPlaying ? '⏸ 暂停播放' : '▶ 开始播放'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRadios.length === 0 && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-semibold">
              没有找到匹配的电台
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              试试其他关键词吧
            </p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Now Playing Bar */}
      {selectedRadio && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  <img
                    src={`https:${selectedRadio.imgUrl}`}
                    alt={selectedRadio.title}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg"
                  />
                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate text-lg">
                    {selectedRadio.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {selectedRadio.desc || '正在播放...'}
                  </p>
                  {isPlaying && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-3 bg-blue-500 animate-pulse rounded"></div>
                      <div className="w-1 h-4 bg-purple-500 animate-pulse rounded" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-2 bg-pink-500 animate-pulse rounded" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-xs text-gray-500 ml-2">直播中</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.pause();
                  } else {
                    audioRef.current?.play();
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform active:scale-95 transition-all"
              >
                {isPlaying ? '⏸ 暂停' : '▶ 播放'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
