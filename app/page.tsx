'use client';

import { useState, useEffect, useRef } from 'react';
import data from '../data.json';

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

  // Simple MD5-like hash simulation (for production, use crypto-js or similar)
  // This is a placeholder - you'll need to implement proper HMAC-MD5
  const sign = btoa(params + 'Lwrpu$K5oP').substring(0, 32);

  return `https://lhttp.qingting.fm/live/${id}/64k.mp3?app_id=web&ts=${ts}&sign=${sign}`;
}

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const radioData = data as RadioData;
  const regions = Object.entries(radioData);

  useEffect(() => {
    if (regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0][0]);
    }
  }, []);

  const handlePlayRadio = (radio: Radio) => {
    if (selectedRadio?.id === radio.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setSelectedRadio(radio);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = getMp3Url(radio.id);
        audioRef.current.play();
      }
    }
  };

  const filteredRadios = selectedRegion
    ? radioData[selectedRegion].radios.filter((radio) =>
        radio.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎵 中国广播电台
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Listen to live FM radio from across China
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索电台..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Region Selector */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {regions.map(([id, region]) => (
              <button
                key={id}
                onClick={() => setSelectedRegion(id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedRegion === id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                }`}
              >
                {region.title}
              </button>
            ))}
          </div>
        </div>

        {/* Radio Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRadios.map((radio) => (
            <div
              key={radio.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={`https:${radio.imgUrl}`}
                  alt={radio.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Radio';
                  }}
                />
                {selectedRadio?.id === radio.id && isPlaying && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    LIVE
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                  {radio.title}
                </h3>
                {radio.desc && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                    {radio.desc}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 mb-3">
                  {radio.playcount && (
                    <span>▶ {(radio.playcount / 10000).toFixed(1)}万</span>
                  )}
                  {radio.podcaster && (
                    <span>👤 {radio.podcaster.username}</span>
                  )}
                </div>
                <button
                  onClick={() => handlePlayRadio(radio)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                    selectedRadio?.id === radio.id && isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {selectedRadio?.id === radio.id && isPlaying ? '⏸ 暂停' : '▶ 播放'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRadios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              没有找到匹配的电台
            </p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Now Playing Bar */}
      {selectedRadio && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={`https:${selectedRadio.imgUrl}`}
                  alt={selectedRadio.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRadio.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRadio.desc || 'Now Playing'}
                  </p>
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
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
