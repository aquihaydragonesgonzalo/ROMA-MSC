import React, { useState, useEffect } from 'react';
import { PRONUNCIATIONS } from '../constants';
import { 
  Volume2, Thermometer, AlertCircle, PhoneCall, Send, Languages, 
  Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, Calendar,
  ArrowRight
} from 'lucide-react';
import { Coordinates } from '../types';

interface GuideProps {
  userLocation: Coordinates | null;
}

interface WeatherData {
  hourly: {
    time: string[];
    temperature: number[];
    code: number[];
  };
  daily: {
    time: string[];
    maxTemp: number[];
    minTemp: number[];
    code: number[];
  };
}

const Guide: React.FC<GuideProps> = ({ userLocation }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.89&longitude=12.49&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome'
        );
        const data = await response.json();
        
        setWeather({
          hourly: {
            time: data.hourly.time,
            temperature: data.hourly.temperature_2m,
            code: data.hourly.weathercode
          },
          daily: {
            time: data.daily.time,
            maxTemp: data.daily.temperature_2m_max,
            minTemp: data.daily.temperature_2m_min,
            code: data.daily.weathercode
          }
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number, size = 20) => {
    if (code <= 1) return <Sun size={size} className="text-amber-500" />;
    if (code <= 3) return <Cloud size={size} className="text-slate-400" />;
    if (code <= 67) return <CloudRain size={size} className="text-blue-500" />;
    if (code <= 77) return <Snowflake size={size} className="text-blue-200" />;
    if (code <= 82) return <CloudRain size={size} className="text-blue-600" />;
    if (code <= 99) return <CloudLightning size={size} className="text-purple-500" />;
    return <Wind size={size} className="text-slate-400" />;
  };

  const playSimulatedAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'it-IT';
      utterance.rate = 0.85;
      setPlaying(word);
      utterance.onend = () => setPlaying(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlaying(word);
      setTimeout(() => setPlaying(null), 1000);
    }
  };

  const handleSOS = () => {
    const message = userLocation 
      ? `¡SOS! Necesito ayuda en Roma. Mi ubicación actual es: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : `¡SOS! Necesito ayuda en Roma. No puedo obtener mi ubicación GPS en este momento.`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold text-red-800 mb-6 uppercase tracking-tight">Guía Roma</h2>

      {/* SOS SECTION */}
      <div className="mb-8 bg-red-600 rounded-[2rem] p-6 shadow-xl shadow-red-900/20 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <div className="bg-white/20 p-2 rounded-xl mr-3">
              <PhoneCall size={24} className="text-white animate-pulse" />
            </div>
            <h3 className="font-black text-lg uppercase tracking-widest">EMERGENCIA SOS</h3>
          </div>
          <p className="text-xs text-red-100 mb-6 leading-relaxed font-medium">
            Si te pierdes o necesitas asistencia inmediata, pulsa el botón para enviar tu ubicación GPS por WhatsApp.
          </p>
          <button 
            onClick={handleSOS}
            className="w-full py-4 bg-white text-red-700 font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg uppercase tracking-widest text-sm"
          >
            <Send size={18} />
            Enviar SOS por WhatsApp
          </button>
        </div>
      </div>

      {/* WEATHER SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-800 flex items-center uppercase tracking-widest">
            <Thermometer size={20} className="mr-2.5 text-red-600"/> Tiempo en Roma
          </h3>
          {!loadingWeather && <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full">
            <ArrowRight size={10} className="animate-pulse" /> DESLIZA
          </div>}
        </div>
        
        {loadingWeather ? (
          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-50 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando Clima...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hourly Forecast Strip */}
            <div className="bg-white p-2 pb-5 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              
              <div className="flex overflow-x-auto custom-h-scrollbar gap-3 px-6 py-4 items-stretch">
                {weather?.hourly.time.map((time, i) => {
                  const hour = new Date(time).getHours();
                  if (hour >= 7 && hour <= 19) {
                    return (
                      <div key={time} className="flex flex-col items-center justify-between min-w-[70px] p-3 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm transition-transform active:scale-95">
                        <span className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">{hour}:00</span>
                        <div className="p-2 bg-white rounded-2xl mb-2 flex items-center justify-center shadow-sm">
                          {getWeatherIcon(weather.hourly.code[i], 28)}
                        </div>
                        <span className="text-base font-black text-slate-800 tracking-tighter">{Math.round(weather.hourly.temperature[i])}°</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className="mt-1 flex justify-center">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Pronóstico del Día</span>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-md overflow-hidden">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-red-700" /> Próximos 5 días
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {weather?.daily.time.slice(0, 5).map((date, i) => {
                  const d = new Date(date);
                  const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                  const dayNum = d.getDate();
                  return (
                    <div key={date} className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-center gap-3 w-20">
                        <span className="text-xs font-black text-red-800 uppercase">{dayName}</span>
                        <span className="text-xs font-bold text-slate-400">{dayNum}</span>
                      </div>
                      <div className="flex-1 flex justify-center">
                        {getWeatherIcon(weather.daily.code[i], 22)}
                      </div>
                      <div className="flex gap-3 w-20 justify-end">
                        <span className="text-sm font-black text-slate-800">{Math.round(weather.daily.maxTemp[i])}°</span>
                        <span className="text-sm font-bold text-slate-400">{Math.round(weather.daily.minTemp[i])}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
          <div className="flex items-center mb-3 text-red-800 font-black text-xs uppercase tracking-widest">
             <AlertCircle size={16} className="mr-2 text-red-600"/> Reserva Online
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Reserva tickets (tren, Coliseo) online con antelación. Roma está saturada en 2026.
          </p>
        </div>
      </div>

      {/* Pronunciation Table */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1">
        <Languages size={20} className="mr-2.5 text-red-600"/> Italiano Básico
      </h3>
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden mb-8">
        {PRONUNCIATIONS.map((item, idx) => (
          <div key={item.word} className={`p-5 flex justify-between items-center group ${idx !== PRONUNCIATIONS.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-red-900 text-lg tracking-tight">{item.word}</p>
                <button 
                  onClick={() => playSimulatedAudio(item.word)}
                  className={`p-2 rounded-full transition-all active:scale-90 ${playing === item.word ? 'bg-red-100 text-red-600 shadow-inner' : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-400'}`}
                >
                  <Volume2 size={16} className={playing === item.word ? 'animate-pulse' : ''} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-1 font-medium tracking-tight opacity-75">"{item.simplified}"</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block uppercase tracking-widest border border-slate-200">
                {item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;