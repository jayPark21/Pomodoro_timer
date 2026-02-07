import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PomodoroTimer = () => {
    const [selectedTime, setSelectedTime] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState('Focus'); // 'Focus' or 'Break'
    const [cycles, setCycles] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    const timerRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timerRef.current);
            handleSessionEnd();
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    // Sound synthesis using Web Audio API for reliability
    const playBeep = (frequency = 440, duration = 0.1, type = 'sine') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    };

    const playStartSound = () => {
        // "Tu-tu-tu" high sequence
        setTimeout(() => playBeep(880, 0.1, 'square'), 0);
        setTimeout(() => playBeep(880, 0.1, 'square'), 150);
        setTimeout(() => playBeep(1760, 0.2, 'square'), 300);
    };

    const playEndSound = () => {
        // "Beep" low
        playBeep(440, 0.3, 'sine');
    };

    // Sound Logic: Beep every second during last 10 seconds
    useEffect(() => {
        if (isActive && timeLeft > 0 && timeLeft <= 10) {
            playBeep(880, 0.1, 'sine');
        }
    }, [timeLeft, isActive]);

    const stopSound = () => {
        // Web Audio API handles stop automatically via duration
    };

    const handleSessionEnd = () => {
        stopSound();

        setSessionType((prevType) => {
            if (prevType === 'Focus') {
                // Focus -> Break: Single Beep
                playEndSound();
                setTimeLeft(1 * 60); // 1 minute break
                setCycles(prev => prev + 1);
                showToast(`Focus complete! Take a 1-minute break! ☕`);
                return 'Break';
            } else {
                // Break -> Focus: Tu-tu-tu Start Sound
                playStartSound();
                setTimeLeft(selectedTime * 60); // Back to selected focus time
                showToast(`Break over! Let's focus for ${selectedTime} minutes! 🚀`);
                return 'Focus';
            }
        });

        // Auto-start next session
        setIsActive(true);
    };

    const toggleTimer = () => {
        if (!isActive) {
            // Initialize AudioContext on user interaction
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            if (sessionType === 'Focus') {
                playStartSound();
            }
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        stopSound();
        setIsActive(false);
        setSessionType('Focus');
        setTimeLeft(selectedTime * 60);
    };

    const handleTimeSelect = (minutes) => {
        stopSound();
        setSelectedTime(minutes);
        setTimeLeft(minutes * 60);
        setIsActive(false);
        setSessionType('Focus');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = sessionType === 'Focus'
        ? (timeLeft / (selectedTime * 60)) * 100
        : (timeLeft / (1 * 60)) * 100;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-4 font-sans text-slate-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md bg-[#1e293b] rounded-[3rem] p-8 shadow-2xl border border-slate-700/50 overflow-hidden"
            >
                {/* Background Decorative Rings */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    {/* Mode Display Badge */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            backgroundColor: sessionType === 'Focus' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            borderColor: sessionType === 'Focus' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-3 mb-8 px-6 py-3 rounded-full border-2 backdrop-blur-sm"
                    >
                        {sessionType === 'Focus' ? (
                            <Target className="w-6 h-6 text-rose-400" />
                        ) : (
                            <Coffee className="w-6 h-6 text-emerald-400" />
                        )}
                        <span className={`text-lg font-black tracking-wider ${sessionType === 'Focus' ? 'text-rose-100' : 'text-emerald-100'}`}>
                            {sessionType === 'Focus' ? '🔥 열정 집중 모드' : '🍃 꿀맛 휴식 모드'}
                        </span>
                    </motion.div>

                    {/* Time Selection Chips */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-[280px]">
                        {[5, 10, 15, 20, 25, 30].map((time) => (
                            <motion.button
                                key={time}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTimeSelect(time)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedTime === time && sessionType === 'Focus'
                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {time}m
                            </motion.button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative mb-12 flex items-center justify-center">
                        {/* SVG Progress Ring */}
                        <svg className="w-64 h-64 transform -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            <motion.circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 120}
                                animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - progress / 100) }}
                                transition={{ duration: 1, ease: "linear" }}
                                fill="transparent"
                                strokeLinecap="round"
                                className={`${sessionType === 'Focus' ? 'text-rose-500' : 'text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                key={timeLeft}
                                initial={{ scale: 0.95, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-7xl font-black font-mono tracking-tighter"
                            >
                                {formatTime(timeLeft)}
                            </motion.span>
                            <div className="mt-2 flex items-center gap-1 text-slate-400 text-sm">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>Cycles: {cycles}</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={resetTimer}
                            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 transition-colors border border-slate-700"
                            title="Reset"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTimer}
                            className={`p-6 rounded-3xl flex items-center justify-center shadow-lg transition-all ${isActive
                                ? 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                                : (sessionType === 'Focus' ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white')
                                }`}
                        >
                            <AnimatePresence mode="wait">
                                {isActive ? (
                                    <motion.div
                                        key="pause"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                    >
                                        <Pause className="w-8 h-8 fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="play"
                                        initial={{ opacity: 0, rotate: 90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: -90 }}
                                    >
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <div className="w-14" /> {/* Spacer to balance reset button */}
                    </div>
                </div>

                {/* Bottom Quote/Status */}
                <div className="mt-10 text-center text-slate-400 text-sm font-medium">
                    {sessionType === 'Focus'
                        ? "“위대한 성과는 끈질긴 집중에서 나온다!”"
                        : "“휴식도 훈련이다. 뇌를 식혀라!”"}
                </div>
            </motion.div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-indigo-400/30"
                    >
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span className="font-medium">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Label */}
            <div className="fixed bottom-6 text-slate-500 text-[10px] tracking-[0.2em] uppercase">
                Designed by Ttang7i for the Beloved CEO
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="App">
            <PomodoroTimer />
        </div>
    );
}

export default App;
