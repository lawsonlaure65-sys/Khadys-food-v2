import React, { useState, useEffect } from 'react';
import {
  Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink,
  Shield, Server, Key, Terminal, ArrowRight, X, Cloud, Sparkles
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  resetSupabaseCredentials,
  testSupabaseConnection,
  syncAllMenuItemsToSupabase,
  fetchSupabaseMenuItems,
  SUPABASE_SQL_SCHEMA
} from '../utils/supabaseClient';
import { MenuItem } from '../types';

interface AdminSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: MenuItem[];
  onImportItemsFromSupabase: (items: MenuItem[]) => void;
}

export const AdminSupabaseModal: React.FC<AdminSupabaseModalProps> = ({
  isOpen,
  onClose,
  currentItems,
  onImportItemsFromSupabase
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    hasTables: boolean;
    itemsCount: number;
  } | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'sql' | 'sync'>('config');

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      // Auto run quick test
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Erreur inconnue',
        hasTables: false,
        itemsCount: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    saveSupabaseCredentials(url, anonKey);
    await handleTestConnection();
  };

  const handleResetDefaults = async () => {
    resetSupabaseCredentials();
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.anonKey);
    await handleTestConnection();
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllMenuItemsToSupabase(currentItems);
      if (res.success) {
        alert(`✅ ${res.count} plats synchronisés avec succès vers Supabase !`);
        await handleTestConnection();
      } else {
        alert(`❌ Erreur de synchronisation : ${res.error}`);
      }
    } catch (err: any) {
      alert(`❌ Erreur: ${err?.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFromSupabase = async () => {
    setIsImporting(true);
    try {
      const cloudItems = await fetchSupabaseMenuItems();
      if (cloudItems && cloudItems.length > 0) {
        onImportItemsFromSupabase(cloudItems);
        alert(`✅ ${cloudItems.length} plats chargés depuis Supabase avec succès !`);
      } else {
        alert("⚠️ Aucun plat trouvé dans la table 'menu_items' de Supabase.");
      }
    } catch (err: any) {
      alert(`❌ Erreur: ${err?.message || err}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-[#18120F] border-2 border-amber-500/50 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-[#F7F4EE]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#120D0A] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <span>Paramètres Supabase & Schéma SQL</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  Cloud Live
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Synchronisation de la base de données relationnelle PostgreSQL pour Khady's Food
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#1A1411] border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'config'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. Clés & Connexion</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'sql'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Script SQL Complet</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sync')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'sync'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>3. Synchronisation Plats ({currentItems.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
            testResult?.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : testResult === null
              ? 'bg-stone-900 border-stone-800 text-stone-300'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {testResult?.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold">
                  {testResult ? testResult.message : 'Vérification de la connexion Supabase en cours...'}
                </div>
                {testResult?.hasTables && (
                  <div className="text-[11px] text-emerald-400 font-medium">
                    ✨ Base de données synchronisée : {testResult.itemsCount} plats disponibles dans le Cloud.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 border border-stone-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Tester</span>
            </button>
          </div>

          {/* TAB 1: CONFIG */}
          {activeSubTab === 'config' && (
            <div className="space-y-4">
              <div className="space-y-3 p-4 rounded-2xl bg-[#1C1613] border border-stone-800">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">
                    URL par défaut liée au projet Vercel Khady's Food.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Supabase Anon / Public API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={e => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">
                    Clé publique sécurisée autorisée pour les requêtes avec politiques RLS.
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-black text-xs uppercase tracking-wider shadow"
                  >
                    Enregistrer les Paramètres
                  </button>

                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-xs font-bold border border-stone-700"
                  >
                    Restaurer Défaut Vercel
                  </button>
                </div>
              </div>

              {/* Instructions guide */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs text-stone-300">
                <span className="font-black text-amber-400 block uppercase">
                  💡 Comment lier votre propre projet Supabase :
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Créez un projet gratuit sur <strong>supabase.com</strong>.</li>
                  <li>Copiez votre <strong>Project URL</strong> et votre <strong>Anon Key</strong> depuis <em>Project Settings → API</em>.</li>
                  <li>Collez-les ci-dessus et cliquez sur <strong>Enregistrer</strong>.</li>
                  <li>Allez sur l'onglet <strong>2. Script SQL Complet</strong> pour créer les tables requises en 1 clic.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: SQL SCHEMA */}
          {activeSubTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Script SQL des Tables (PostgreSQL / Supabase)
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Crée automatiquement les tables <code>menu_items</code>, <code>orders</code>, <code>reviews</code> et <code>app_settings</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopySQL}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-4 h-4 text-stone-950" />
                      <span>Copié dans le presse-papiers !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le Script SQL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step by step box */}
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1 text-xs text-stone-300">
                <span className="font-bold text-white block">Étapes rapides dans Supabase :</span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  1. Rendez-vous sur votre dashboard Supabase → <strong>SQL Editor</strong>.<br />
                  2. Cliquez sur <strong>New query</strong>.<br />
                  3. Collez ce script et cliquez sur le bouton vert <strong>Run</strong>.<br />
                  4. Revenez ici et cliquez sur <em>Tester la connexion</em>.
                </p>
              </div>

              {/* Code display */}
              <div className="relative rounded-2xl bg-black/90 border border-stone-800 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-72">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC */}
          {activeSubTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#1C1613] border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">
                      Synchronisation Bidirectionnelle
                    </h3>
                    <p className="text-xs text-stone-400">
                      Exportez vos plats locaux vers Supabase ou téléchargez la dernière version Cloud.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncing}
                    className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-center"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronisation...' : `⚡ Sauvegarder Tout vers Supabase (${currentItems.length} plats)`}</span>
                  </button>

                  <button
                    onClick={handleImportFromSupabase}
                    disabled={isImporting}
                    className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow active:scale-95 transition-all text-center"
                  >
                    <Database className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                    <span>{isImporting ? 'Chargement...' : '🔄 Charger les Plats depuis Supabase'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-stone-300 space-y-1">
                <span className="font-bold text-emerald-400 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mode Automatique Activé :
                </span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Désormais, dès que vous ajoutez, modifiez ou supprimez un plat dans la console d'administration, il est <strong>automatiquement mis à jour en direct dans Supabase</strong> ET dans le stockage local offline.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
