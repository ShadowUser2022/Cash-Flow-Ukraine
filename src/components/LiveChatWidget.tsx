/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Player } from '../types';
import { 
  MessageSquare, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Minimize2, 
  Volume2, 
  Play, 
  Square, 
  Bot, 
  Radio, 
  Smile,
  VolumeX,
  FileText
} from 'lucide-react';

interface LiveChatWidgetProps {
  myPlayer: Player | null;
  players: Player[];
  messages: ChatMessage[];
  onSendMessage: (text: string, mediaType?: 'text' | 'audio', audioUrl?: string) => void;
  onSimulateBotMessage?: () => void;
}

// Sub-component for rendering voice audio playback in chat messages using native HTML5 controls
function AudioPlayerItem({ audioUrl, defaultText }: { audioUrl?: string; defaultText: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-1 px-1 min-w-[180px]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
        <span>🎤 {defaultText || 'Голосове повідомлення'}</span>
      </div>
      {audioUrl ? (
        <audio 
          controls 
          src={audioUrl} 
          className="w-full h-8 rounded-lg outline-none filter invert contrast-125 opacity-90" 
          preload="metadata"
        />
      ) : (
        <div className="text-[10px] text-slate-400 italic">Голосове аудіо записано</div>
      )}
    </div>
  );
}

export default function LiveChatWidget({
  myPlayer,
  players,
  messages,
  onSendMessage,
  onSimulateBotMessage
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'VIDEO'>('CHAT');
  const [inputText, setInputText] = useState('');
  
  // Media states
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isSpeechTranscribing, setIsSpeechTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Audio / Video / Speech refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  // Scroll to bottom & track unread
  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!isOpen) {
        setUnreadCount((prev) => prev + (messages.length - prevMessagesLength.current));
      }
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isOpen]);

  // Bind video element when camera is turned on or tab changes
  useEffect(() => {
    if (isCameraOn && localVideoRef.current && mediaStreamRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOn, activeTab, isOpen]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle Camera toggle
  const toggleCamera = async () => {
    if (isCameraOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(track => track.stop());
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        setIsCameraOn(true);
        setIsMicOn(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setIsCameraOn(true);
      }
    }
  };

  // Handle Mic toggle
  const toggleMic = async () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => t.enabled = !isMicOn);
    }
    setIsMicOn(!isMicOn);
  };

  // Speech Recognition (Voice-to-Text Transcription in Ukrainian)
  const startSpeechTranscription = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Ваш браузер не підтримує розпізнавання мови. Буде використано стандартний аудіозапис.');
      startRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'uk-UA'; // Ukrainian language
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsSpeechTranscribing(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsSpeechTranscribing(false);
      };

      recognition.onend = () => {
        setIsSpeechTranscribing(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      startRecording();
    }
  };

  const stopSpeechTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsSpeechTranscribing(false);
  };

  // Audio recording with browser supported MIME types (Safari & Chrome compatible)
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const supportedMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/aac';

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMime });
        
        // Convert to Base64 Data URL so all clients can play it
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioUrl = reader.result as string;
          onSendMessage('🎤 Голосове повідомлення', 'audio', base64AudioUrl);
        };

        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(200);
      setIsRecordingAudio(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      onSendMessage(`🎤 Голосове повідомлення`, 'text');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecordingAudio(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const sendQuickEmoji = (emoji: string) => {
    onSendMessage(emoji);
  };

  const botsInGame = players.filter((p) => p.isBot);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      
      {/* FLOATING TRIGGER BUTTON WHEN CLOSED */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="relative px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer group"
          aria-label="Відкрити онлайн чат"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-slate-200" />
            {(isCameraOn || isMicOn) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-800 animate-pulse" />
            )}
          </div>
          <span className="text-xs font-bold font-sans tracking-wide">Чат та Медіа</span>

          {unreadCount > 0 && (
            <span className="bg-emerald-500 border border-emerald-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* EXPANDED CHAT WINDOW */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[530px] max-h-[80vh] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
          
          {/* HEADER */}
          <div className="bg-slate-950/90 border-b border-slate-800 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                  Live Чат & Відео
                  <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-mono">
                    ONLINE ({players.length})
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Транскрипція мови, аудіо та відео</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab(activeTab === 'CHAT' ? 'VIDEO' : 'CHAT')}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                  activeTab === 'VIDEO'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Переключити відеокімнату"
              >
                <Video className="w-3.5 h-3.5 text-slate-100" />
              </button>

              <button
                onClick={handleToggleOpen}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Згорнути"
              >
                <Minimize2 className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>

          {/* VIDEO / AUDIO AVATARS GRID BAR */}
          {(activeTab === 'VIDEO' || isCameraOn || isMicOn) && (
            <div className="bg-slate-950/80 border-b border-slate-800/80 p-2.5 grid grid-cols-3 gap-2">
              {/* Local User Stream Tile */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center group">
                {isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-1 text-center">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner mb-1"
                      style={{ backgroundColor: myPlayer?.color || '#3b82f6' }}
                    >
                      {myPlayer?.name[0] || 'Я'}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate max-w-[60px]">{myPlayer?.name || 'Ви'}</span>
                  </div>
                )}

                {/* Mic & Cam Quick Toggles on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    onClick={toggleMic}
                    className={`p-1.5 rounded-lg ${isMicOn ? 'bg-emerald-600' : 'bg-rose-600'} text-white cursor-pointer`}
                  >
                    {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleCamera}
                    className={`p-1.5 rounded-lg ${isCameraOn ? 'bg-indigo-600' : 'bg-slate-700'} text-white cursor-pointer`}
                  >
                    {isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute bottom-1 left-1 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isMicOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[8px] text-white font-medium bg-black/60 px-1 rounded truncate">
                    Ви {isMicOn ? '(Мік)' : ''}
                  </span>
                </div>
              </div>

              {/* Other Connected Players Tiles */}
              {players.filter(p => p.id !== myPlayer?.id).slice(0, 2).map((player) => (
                <div 
                  key={player.id} 
                  className="relative aspect-video bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col items-center justify-center p-1 text-center"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner mb-1"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name[0]}
                  </div>
                  <span className="text-[9px] text-slate-300 truncate max-w-[60px]">{player.name}</span>
                  {player.isBot && (
                    <span className="text-[7px] bg-slate-800 text-slate-400 px-1 rounded font-mono">BOT</span>
                  )}
                  <div className="absolute bottom-1 right-1">
                    <Volume2 className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA QUICK CONTROLS BAR */}
          <div className="bg-slate-950/60 border-b border-slate-800/60 px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  isMicOn 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-slate-400" />}
                <span>{isMicOn ? 'Мікрофон вмик' : 'Увімкнути мік'}</span>
              </button>

              <button
                onClick={toggleCamera}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  isCameraOn 
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {isCameraOn ? <Video className="w-3 h-3 text-indigo-400" /> : <VideoOff className="w-3 h-3 text-slate-400" />}
                <span>{isCameraOn ? 'Камера вмик' : 'Камера'}</span>
              </button>
            </div>

            {/* Test Bot Message Button */}
            {botsInGame.length > 0 && onSimulateBotMessage && (
              <button
                onClick={onSimulateBotMessage}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 font-bold transition-all active:scale-95 cursor-pointer"
                title="Надіслати тестове повідомлення від бота"
              >
                <Bot className="w-3 h-3 text-slate-300" />
                <span>Тест бота</span>
              </button>
            )}
          </div>

          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                <MessageSquare className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                <p className="font-medium text-slate-400 text-xs">Ласкаво просимо до ігрового чату!</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Спілкуйтеся текстом, використовуйте голос-у-текст транскрипцію або вмикайте відео
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === myPlayer?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: msg.senderColor }}
                      />
                      <span className="text-[10px] font-bold text-slate-300">
                        {isMe ? 'Ви' : msg.senderName}
                      </span>
                      {msg.isBot && (
                        <span className="text-[8px] bg-slate-800 text-slate-300 border border-slate-700 px-1 rounded font-mono">
                          BOT
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-2.5 text-slate-100 shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-slate-700 text-white rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.mediaType === 'audio' ? (
                        <AudioPlayerItem audioUrl={msg.audioUrl} defaultText={msg.text || 'Голосове повідомлення'} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* QUICK EMOJI TOOLBAR */}
          <div className="bg-slate-950/90 border-t border-slate-800 px-3 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 flex-shrink-0">
              <Smile className="w-3 h-3 text-slate-400" /> Реакції:
            </span>
            {['🚀', '💰', '🎉', '📈', '🤝', '💸', '🇺🇦'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendQuickEmoji(emoji)}
                className="hover:scale-125 transition-transform text-sm p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* INPUT BAR WITH VOICE TRANSCRIPTION & RECORDING */}
          <form onSubmit={handleSendText} className="bg-slate-950 border-t border-slate-800 p-2.5 flex items-center gap-2">
            
            {/* Speech Recognition (Voice to Text Transcription) */}
            {!isSpeechTranscribing ? (
              <button
                type="button"
                onClick={startSpeechTranscription}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Надиктувати текст голосом (Транскрипція мови українською)"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopSpeechTranscription}
                className="p-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold animate-pulse cursor-pointer shadow-md"
                title="Слухаю... Натисніть для зупинки"
              >
                <Mic className="w-4 h-4 fill-white" />
                <span>Слухаю...</span>
              </button>
            )}

            {/* Direct Audio Note Recorder Button */}
            {!isRecordingAudio ? (
              <button
                type="button"
                onClick={startRecording}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Записати аудіофайл"
              >
                <FileText className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold animate-pulse cursor-pointer shadow-md"
                title="Зупинити та надіслати аудіофайл"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>{recordingTime}с</span>
              </button>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isSpeechTranscribing ? 'Говоріть (транскрипція...)' : (isRecordingAudio ? 'Запис аудіо...' : 'Напишіть або надиктуйте...')}
              disabled={isRecordingAudio}
              className="flex-1 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-600 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isRecordingAudio}
              className="p-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-xl transition-all active:scale-95 cursor-pointer"
              aria-label="Надіслати"
            >
              <Send className="w-4 h-4 text-slate-200" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
