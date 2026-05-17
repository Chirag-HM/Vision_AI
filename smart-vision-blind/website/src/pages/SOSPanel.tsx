import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Phone,
  Mail,
  AlertTriangle,
  History,
  UserPlus,
  Trash2
} from 'lucide-react';

interface Contact {
  name: string;
  phone: string;
  email: string;
}

export const SOSPanel: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();

  // Emergency contact list state
  const [contacts, setContacts] = useState<Contact[]>([
    { name: 'Dr. Sarah Carter (Physician)', phone: '+1 (555) 012-4455', email: 'sarah.carter@hospital.org' },
    { name: 'David Miller (Son / Caregiver)', phone: '+1 (555) 887-3322', email: 'david.miller@family.com' },
  ]);

  // Form states for adding contact
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Dispatch simulation logs state
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    'System Initialized: SOS module in active standby.',
  ]);

  const [sosActive, setSosActive] = useState(false);

  // Trigger Panic SOS sequence
  const handleTriggerSOS = () => {
    setSosActive(true);
    const newLog = `SOS DISPATCHED AT ${new Date().toLocaleTimeString()}! SMS and emails containing precise Mapbox coordinates (12.9716, 77.5946) dispatched to: ${contacts.map((c) => c.name).join(', ')}.`;
    
    setDispatchLogs((prev) => [newLog, ...prev]);
    speak("Danger warning! SOS panic dispatched successfully. Emergency contacts are being notified.");
  };

  const handleDeactivateSOS = () => {
    setSosActive(false);
    speak("SOS state deactivated. Safety restored.");
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPhone && newEmail) {
      setContacts((prev) => [...prev, { name: newName, phone: newPhone, email: newEmail }]);
      speak(`Contact ${newName} added successfully.`);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setShowAddForm(false);
    }
  };

  const handleDeleteContact = (index: number, name: string) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
    speak(`Contact ${name} deleted.`);
  };

  // 1. SIMPLE ACCESSIBLE LAYOUT
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-5xl font-black mb-6 border-b-4 border-white pb-4">
          EMERGENCY S.O.S. CRISIS ROOM
        </h1>

        {sosActive ? (
          <div className="bg-red-600 border-8 border-white p-8 text-center space-y-6 animate-pulse">
            <h2 className="text-5xl font-black">!!! EMERGENCY S.O.S. ACTIVE !!!</h2>
            <p className="text-3xl font-bold leading-relaxed">
              We have broadcasted your current coordinates to your registered emergency team. Help is on the way.
            </p>
            <button
              onClick={handleDeactivateSOS}
              className="w-full bg-white text-black text-4xl font-black py-8 border-4 border-white hover:bg-gray-200"
            >
              DEACTIVATE S.O.S.
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Giant accessible tap trigger */}
            <button
              onClick={handleTriggerSOS}
              className="w-full bg-red-600 hover:bg-red-500 text-white text-5xl font-black py-12 border-8 border-white focus:ring-8 focus:ring-yellow-400 block shadow-2xl animate-pulse"
              aria-label="Danger trigger! Press enter or double tap this large button to dispatch immediate emergency SOS alert."
            >
              TAP TO SEND S.O.S. NOW
            </button>

            {/* Emergency contacts list */}
            <div className="border-4 border-white p-6 bg-black space-y-4">
              <h2 className="text-3xl font-black">YOUR EMERGENCY TEAM</h2>
              <ul className="space-y-4">
                {contacts.map((c, index) => (
                  <li key={index} className="p-4 border-2 border-white text-2xl font-bold">
                    <p>Name: {c.name}</p>
                    <p>Phone: {c.phone}</p>
                    <button
                      onClick={() => handleDeleteContact(index, c.name)}
                      className="bg-white text-black px-4 py-2 mt-2 text-xl font-bold hover:bg-red-500 hover:text-white"
                      aria-label={`Delete emergency contact ${c.name}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 2. PREMIUM DYNAMIC PORTAL (DARK THEME)
  return (
    <div className="min-h-screen bg-[#0a0f2c] pt-28 pb-16 text-white relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Column: Giant Panic Trigger */}
        <div className="lg:col-span-1 space-y-8">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
            SOS Control Panel
          </h1>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Emergency Alarm
            </h2>

            <AnimatePresence mode="wait">
              {!sosActive ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <button
                    onClick={handleTriggerSOS}
                    className="relative w-44 h-44 bg-gradient-to-tr from-red-600 to-red-500 rounded-full border-4 border-white/20 shadow-2xl shadow-red-600/30 flex items-center justify-center hover:scale-105 transition-all group focus:outline-none focus:ring-4 focus:ring-red-400"
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-25 animate-ping group-hover:scale-125 transition-all" />
                    <AlertTriangle className="w-16 h-16 text-white animate-bounce" />
                  </button>
                  <p className="text-xs text-slate-500">
                    Double-click or tap to trigger the emergency coordinator broadcast pipeline.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex flex-col items-center"
                >
                  <div className="w-44 h-44 bg-red-600 rounded-full border-4 border-red-500 shadow-2xl flex items-center justify-center animate-ping">
                    <ShieldAlert className="w-16 h-16 text-white" />
                  </div>
                  <div className="text-red-400 font-bold animate-pulse text-lg">DISPATCHING ALERTS...</div>
                  <button
                    onClick={handleDeactivateSOS}
                    className="bg-white text-black hover:bg-slate-200 px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
                  >
                    Cancel Emergency SOS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side Column: Contacts & Dispatch Log */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Emergency contacts card */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" /> Emergency Team Contacts
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/20 transition-all"
              >
                {showAddForm ? 'Close' : 'Add Contact'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddContact} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400" /> Add Team Member
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-[#0a0f2c] border border-white/10 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-[#0a0f2c] border border-white/10 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-[#0a0f2c] border border-white/10 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all">
                  Save Contact
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <div key={index} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{contact.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-500" /> {contact.phone}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-500" /> {contact.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(index, contact.name)}
                    className="p-2 hover:bg-red-600/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                    aria-label={`Remove emergency contact ${contact.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Logs card */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-4">
              <History className="w-5 h-5 text-blue-500" /> Dispatch History Logs
            </h2>

            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 font-mono text-xs">
              {dispatchLogs.map((log, index) => (
                <div key={index} className="p-3 bg-white/5 border-l-2 border-blue-500 rounded-r-xl leading-relaxed text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
