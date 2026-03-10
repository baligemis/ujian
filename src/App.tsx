import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Monitor, Lock, CheckCircle2, User, FileText, Globe, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [examState, setExamState] = useState<'setup' | 'running' | 'blocked' | 'finished'>('setup');
  const [studentName, setStudentName] = useState('');
  const [nisn, setNisn] = useState('');
  const [examUrl, setExamUrl] = useState('https://example.com');
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const MAX_WARNINGS = 3;

  const examContainerRef = useRef<HTMLDivElement>(null);

  // Anti-cheat hooks
  useEffect(() => {
    if (examState !== 'running') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'V')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [examState, warnings]);

  const handleViolation = () => {
    const newWarnings = warnings + 1;
    setWarnings(newWarnings);
    if (newWarnings >= MAX_WARNINGS) {
      setExamState('blocked');
      exitFullscreen();
    } else {
      setShowWarningModal(true);
    }
  };

  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log(err));
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  const startExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !nisn || !examUrl) return;
    
    requestFullscreen();
    setExamState('running');
    setWarnings(0);
  };

  const finishExam = () => {
    setExamState('finished');
    exitFullscreen();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Setup Screen */}
      {examState === 'setup' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
          >
            <div className="bg-emerald-600 p-6 text-white text-center">
              <div className="mx-auto bg-white w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-md overflow-hidden">
                {!logoError ? (
                  <img 
                    src="/logo.png" 
                    alt="Logo MIS Balige" 
                    className="w-full h-full object-contain p-2"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <ShieldAlert className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">MIS Balige Exam Browser</h1>
              <p className="text-emerald-100 mt-2 text-sm">Portal Ujian Aman & Terpercaya</p>
            </div>
            
            <form onSubmit={startExam} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NISN / No Peserta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Masukkan NISN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Soal Ujian</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="url" 
                    required
                    value={examUrl}
                    onChange={(e) => setExamUrl(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Perhatian sebelum memulai:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Aplikasi akan masuk ke mode layar penuh.</li>
                    <li>Dilarang keluar dari aplikasi atau membuka tab lain.</li>
                    <li>Batas maksimal pelanggaran adalah {MAX_WARNINGS} kali.</li>
                  </ul>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <Monitor className="w-5 h-5" />
                <span>Mulai Ujian Sekarang</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Running Exam Screen */}
      {examState === 'running' && (
        <div className="h-screen flex flex-col bg-white overflow-hidden select-none" ref={examContainerRef}>
          {/* Header */}
          <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-sm leading-tight">MIS Balige Exam Browser</h2>
                <p className="text-xs text-emerald-200">{studentName} ({nisn})</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-800/50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className={`w-4 h-4 ${warnings > 0 ? 'text-amber-400' : 'text-emerald-300'}`} />
                <span className="text-sm font-medium">Pelanggaran: {warnings}/{MAX_WARNINGS}</span>
              </div>
              <button 
                onClick={finishExam}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Selesai</span>
              </button>
            </div>
          </div>

          {/* Iframe Content */}
          <div className="flex-1 relative bg-slate-100">
            <iframe 
              src={examUrl} 
              className="w-full h-full border-none"
              title="Exam Content"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>

          {/* Warning Modal */}
          <AnimatePresence>
            {showWarningModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                >
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Peringatan Pelanggaran!</h3>
                  <p className="text-slate-600 mb-6">
                    Anda terdeteksi keluar dari layar ujian atau membuka aplikasi lain. Ini adalah peringatan ke-{warnings} dari maksimal {MAX_WARNINGS}.
                  </p>
                  <button 
                    onClick={() => {
                      setShowWarningModal(false);
                      requestFullscreen();
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Saya Mengerti, Lanjutkan Ujian
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Blocked Screen */}
      {examState === 'blocked' && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-red-100"
          >
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Ujian Diblokir</h2>
            <p className="text-slate-600 mb-6">
              Mohon maaf {studentName}, ujian Anda telah dihentikan karena Anda telah melakukan pelanggaran lebih dari {MAX_WARNINGS} kali.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-slate-500 mb-1">Nama: <span className="font-medium text-slate-900">{studentName}</span></p>
              <p className="text-sm text-slate-500 mb-1">NISN: <span className="font-medium text-slate-900">{nisn}</span></p>
              <p className="text-sm text-slate-500">Status: <span className="font-medium text-red-600">Terblokir (Indikasi Kecurangan)</span></p>
            </div>
            <button 
              onClick={() => setExamState('setup')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Kembali ke Beranda
            </button>
          </motion.div>
        </div>
      )}

      {/* Finished Screen */}
      {examState === 'finished' && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-emerald-100"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Ujian Selesai</h2>
            <p className="text-slate-600 mb-6">
              Terima kasih {studentName}, Anda telah menyelesaikan ujian dengan baik.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-slate-500 mb-1">Nama: <span className="font-medium text-slate-900">{studentName}</span></p>
              <p className="text-sm text-slate-500 mb-1">NISN: <span className="font-medium text-slate-900">{nisn}</span></p>
              <p className="text-sm text-slate-500">Status: <span className="font-medium text-emerald-600">Selesai</span></p>
            </div>
            <button 
              onClick={() => setExamState('setup')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Kembali ke Beranda
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
