/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  Users, 
  Trash2, 
  UserCheck,
  Sparkles,
  Shuffle,
  BarChart3,
  History,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Attendee {
  id: string;
  name: string;
  askedCount: number;
  lastPicked?: number;
}

const BrandLogo = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center overflow-hidden rounded-2xl shadow-xl", className)}>
    <img 
      src="https://drive.google.com/thumbnail?id=1zBcr8zz3WUgL4yAVCbU8fMIyLiRw5ugz&sz=w500" 
      alt="Logo"
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  </div>
);

export default function App() {
  const [inputText, setInputText] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const saved = localStorage.getItem('training_attendees_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  });
  const [isPicking, setIsPicking] = useState(false);
  const [pickedAttendee, setPickedAttendee] = useState<Attendee | null>(null);
  const [showInput, setShowInput] = useState(() => {
    const saved = localStorage.getItem('training_attendees_v2');
    return !saved || JSON.parse(saved).length === 0;
  });
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [history, setHistory] = useState<Attendee[]>(() => {
    const saved = localStorage.getItem('training_history_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  });
  const [rollingNames, setRollingNames] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (confirmReset) {
      const timer = setTimeout(() => setConfirmReset(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmReset]);

  useEffect(() => {
    if (confirmDelete) {
      const timer = setTimeout(() => setConfirmDelete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDelete]);

  useEffect(() => {
    localStorage.setItem('training_attendees_v2', JSON.stringify(attendees));
    localStorage.setItem('training_history_v2', JSON.stringify(history));
  }, [attendees, history]);

  const handleAddAttendees = () => {
    const names = inputText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (names.length === 0) {
      if (attendees.length > 0 && confirm('هل تريد مسح جميع الأسماء؟')) {
        setAttendees([]);
      }
      setShowInput(false);
      return;
    }

    // Preserve askedCount for existing names
    const newAttendees: Attendee[] = names.map(name => {
      const existing = attendees.find(a => a.name === name);
      if (existing) return existing;
      return {
        id: Math.random().toString(36).substring(2, 9),
        name,
        askedCount: 0,
      };
    });

    setAttendees(newAttendees);
    setInputText('');
    setShowInput(false);
  };

  const toggleInput = () => {
    if (!showInput) {
      // Pre-fill with current names for editing
      const currentNames = attendees.map(a => a.name).join('\n');
      setInputText(currentNames);
    }
    setShowInput(!showInput);
  };

  const pickRandom = () => {
    if (attendees.length === 0 || isPicking) return;

    setIsPicking(true);
    setPickedAttendee(null);

    const minAsked = Math.min(...attendees.map(a => a.askedCount));
    const pool = attendees.filter(a => a.askedCount === minAsked);

    let iterations = 0;
    const maxIterations = 25;
    const interval = setInterval(() => {
      const randomName = attendees[Math.floor(Math.random() * attendees.length)].name;
      setRollingNames(prev => [randomName, ...prev].slice(0, 3));
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        const finalPicked = pool[Math.floor(Math.random() * pool.length)];
        
        setPickedAttendee(finalPicked);
        setAttendees(prev => prev.map(a => 
          a.id === finalPicked.id 
            ? { ...a, askedCount: a.askedCount + 1, lastPicked: Date.now() } 
            : a
        ));
        setHistory(prev => [finalPicked, ...prev].slice(0, 8));
        setIsPicking(false);
        
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00C1A1', '#00A3E0', '#FFB81C', '#001A72'],
          gravity: 1.2,
          scalar: 1.2
        });
      }
    }, 70);
  };

  const stats = {
    total: attendees.length,
    asked: attendees.filter(a => a.askedCount > 0).length,
    remaining: attendees.filter(a => a.askedCount === 0).length,
    participationRate: attendees.length > 0 ? Math.round((attendees.filter(a => a.askedCount > 0).length / attendees.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 overflow-x-hidden" dir="rtl">
      {/* Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00C1A1]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB81C]/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="bg-[#001A72] border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo className="w-14 h-14" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Attendly Pro</h1>
              <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-[0.2em]">أتيندلي برو - المساعد الذكي للتدريب</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-8 ml-8 border-l border-white/10 pl-8">
              <div className="text-center">
                <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">الحضور</p>
                <p className="text-white font-black text-xl leading-none">{stats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">المشاركة</p>
                <p className="text-[#00C1A1] font-black text-xl leading-none">{stats.participationRate}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleInput}
                className={cn(
                  "p-3 rounded-2xl transition-all border group",
                  showInput 
                    ? "bg-[#00C1A1] text-white border-[#00C1A1]" 
                    : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                )}
                title={showInput ? "إغلاق المحرر" : "تعديل القائمة / إضافة أسماء"}
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    return;
                  }
                  setAttendees(prev => prev.map(a => ({ ...a, askedCount: 0, lastPicked: undefined })));
                  setHistory([]);
                  setPickedAttendee(null);
                  setConfirmReset(false);
                }}
                className={cn(
                  "h-11 rounded-2xl transition-all border group relative flex items-center gap-2 px-3",
                  confirmReset 
                    ? "bg-orange-500 text-white border-orange-500 w-auto" 
                    : "bg-white/5 hover:bg-white/10 text-[#FFB81C] border-white/10 w-11"
                )}
                title={confirmReset ? "انقر مرة أخرى للتأكيد" : "إعادة البدء (تصفير العداد)"}
              >
                <RotateCcw className={cn("w-5 h-5 shrink-0 transition-transform duration-500", !confirmReset && "group-hover:rotate-180")} />
                {confirmReset && <span className="text-xs font-black whitespace-nowrap animate-pulse">تأكيد التصفير؟</span>}
              </button>

              <button 
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  setAttendees([]);
                  setHistory([]);
                  setPickedAttendee(null);
                  setShowInput(true);
                  setInputText('');
                  setConfirmDelete(false);
                }}
                className={cn(
                  "h-11 rounded-2xl transition-all border group relative flex items-center gap-2 px-3",
                  confirmDelete 
                    ? "bg-red-600 text-white border-red-600 w-auto" 
                    : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 w-11"
                )}
                title={confirmDelete ? "انقر مرة أخرى للتأكيد" : "مسح الكل والبدء من الصفر"}
              >
                <Trash2 className={cn("w-5 h-5 shrink-0", !confirmDelete && "group-hover:animate-bounce")} />
                {confirmDelete && <span className="text-xs font-black whitespace-nowrap animate-pulse">تأكيد المسح؟</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* Left Column: Experience */}
        <div className="lg:col-span-8 space-y-10">
          
          <AnimatePresence>
            {showInput && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-6"
              >
                <div className="flex items-center gap-3 text-[#001A72] font-black text-xl">
                  <LayoutDashboard className="w-6 h-6 text-[#00C1A1]" />
                  <h2>إعداد قائمة الحضور</h2>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={() => {
                    // Small delay to allow button click before it disappears
                    setTimeout(() => setIsTextareaFocused(false), 200);
                  }}
                  placeholder="أدخل الأسماء هنا.. اسم في كل سطر"
                  className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-[#00C1A1]/20 focus:border-[#00C1A1] outline-none transition-all resize-none font-bold text-lg"
                />
                
                <AnimatePresence>
                  {(isTextareaFocused || inputText.trim().length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <button
                        onClick={handleAddAttendees}
                        disabled={!inputText.trim()}
                        className="w-full py-5 bg-gradient-to-r from-[#001A72] to-[#00A3E0] hover:shadow-blue-200/50 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 className="w-7 h-7" />
                        اعتماد القائمة والبدء
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Picker Stage */}
          <div className="bg-[#001A72] p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,26,114,0.5)] flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00C1A1,transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>

            <AnimatePresence mode="wait">
              {isPicking ? (
                <motion.div 
                  key="rolling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="h-32 overflow-hidden relative w-full text-center flex flex-col items-center">
                    <AnimatePresence>
                      {rollingNames.map((name, i) => (
                        <motion.div
                          key={`${name}-${i}`}
                          initial={{ y: 60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 - i * 0.3 }}
                          exit={{ y: -60, opacity: 0 }}
                          className="text-4xl md:text-6xl font-black text-white/50 absolute"
                        >
                          {name}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-3 mt-12">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        className="w-3 h-3 rounded-full bg-[#00C1A1]"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : pickedAttendee ? (
                <motion.div
                  key={pickedAttendee.id}
                  initial={{ scale: 0.2, opacity: 0, rotate: -10 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotate: 0,
                    transition: { type: "spring", stiffness: 200, damping: 15 }
                  }}
                  className="text-center space-y-10 z-10"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center justify-center p-8 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-2xl"
                  >
                    <Sparkles className="w-20 h-20 text-[#FFB81C]" />
                  </motion.div>
                  
                  <div className="space-y-4 w-full max-w-2xl px-4 mx-auto">
                    <p className="text-[#00C1A1] font-black uppercase tracking-[0.4em] text-sm">وقع الاختيار على</p>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] break-words leading-tight">
                      {pickedAttendee.name}
                    </h3>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <div className="px-8 py-4 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4">
                      <UserCheck className="w-7 h-7 text-[#00C1A1]" />
                      <span className="text-white text-xl font-bold">تمت مشاركته {pickedAttendee.askedCount} مرات</span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-8"
                >
                  <div className="w-40 h-40 bg-white/5 rounded-[3.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-700">
                    <Shuffle className="w-20 h-20 text-white/10" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-white/60 text-3xl font-black">جاهز للسحب؟</p>
                    <p className="text-white/30 text-base font-medium">سيتم اختيار شخص لم يشارك بعد لضمان العدالة</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-20 w-full max-w-md relative z-10">
              <button
                onClick={pickRandom}
                disabled={attendees.length === 0 || isPicking}
                className={cn(
                  "w-full py-8 rounded-[2.5rem] font-black text-3xl transition-all flex items-center justify-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] active:scale-95 group overflow-hidden relative",
                  isPicking 
                    ? "bg-white/5 text-white/20 cursor-not-allowed" 
                    : "bg-gradient-to-r from-[#00C1A1] via-[#00A3E0] to-[#FFB81C] text-white hover:shadow-[#00C1A1]/30"
                )}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                {isPicking ? (
                  <>
                    <RotateCcw className="w-10 h-10 animate-spin" />
                    جاري السحب...
                  </>
                ) : (
                  <>
                    <Play className="w-10 h-10 fill-current group-hover:scale-125 transition-transform" />
                    اسحب الاسم التالي
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Feed */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <History className="w-6 h-6 text-[#FFB81C]" />
              <h3 className="text-[#001A72] font-black text-xl">سجل المشاركات الأخيرة</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <p className="text-slate-400 font-medium col-span-full text-center py-4">لا يوجد سجل مشاركات حالياً..</p>
                ) : (
                  history.map((item, i) => (
                    <motion.div
                      key={`${item.id}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm"
                    >
                      <div className="w-2 h-2 bg-[#00C1A1] rounded-full" />
                      <span className="font-bold text-slate-700 truncate">{item.name}</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Stats Overview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-[#00A3E0]" />
              <h3 className="text-[#001A72] font-black text-xl">إحصائيات الجلسة</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-slate-400 font-bold text-sm">إجمالي الحضور</p>
                <p className="text-3xl font-black text-[#001A72]">{stats.total}</p>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.participationRate}%` }}
                  className="h-full bg-gradient-to-r from-[#00C1A1] to-[#00A3E0]"
                />
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#00C1A1]">تمت مشاركتهم: {stats.asked}</span>
                <span className="text-slate-400">بانتظار السؤال: {stats.remaining}</span>
              </div>
            </div>
          </div>

          {/* Attendee List */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-25rem)]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#00A3E0]" />
                <h2 className="font-black text-slate-800 text-lg">قائمة الحضور</h2>
              </div>
              <span className="bg-[#001A72] text-white px-4 py-1.5 rounded-full text-xs font-black">
                {attendees.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {attendees
                  .sort((a, b) => (b.lastPicked || 0) - (a.lastPicked || 0))
                  .map((attendee) => (
                    <motion.div
                      layout
                      key={attendee.id}
                      initial={{ opacity: 0, x: 30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      whileHover={{ scale: 1.01, x: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={cn(
                        "group p-4 rounded-2xl border transition-all flex items-center justify-between relative overflow-hidden cursor-default",
                        attendee.id === pickedAttendee?.id 
                          ? "bg-blue-50 border-blue-300 ring-4 ring-blue-500/10 shadow-lg" 
                          : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner",
                          attendee.askedCount > 0 
                            ? "bg-[#00C1A1] text-white" 
                            : "bg-slate-100 text-slate-400"
                        )}>
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg">{attendee.name}</p>
                          <p className="text-xs font-bold text-slate-400">سُئل {attendee.askedCount} مرات</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setAttendees(prev => prev.filter(a => a.id !== attendee.id))}
                        className="opacity-0 group-hover:opacity-100 p-3 hover:bg-red-50 text-red-400 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00A3E0;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
