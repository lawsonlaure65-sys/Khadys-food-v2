import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Share2, Sparkles, Moon, Sun, Smartphone, Square, 
  Image as ImageIcon, Check, Copy, RefreshCw, Eye, Flame, 
  ChefHat, Award, Clock, Gift, ShoppingBag, ShieldCheck, 
  MessageSquare, Globe, ArrowRight, Palette, Layers, CheckCircle2,
  Music, Facebook, Instagram
} from 'lucide-react';
import { PlatDuJourConfig, PosterTheme, PosterFormat, PublicationTiming, shareToSocialPlatform, broadcastToWhatsApp } from '../utils/marketing';
import { RESTAURANT_INFO } from '../constants';
import { playSound } from '../utils/audio';

interface PlatDuJourPosterStudioProps {
  plat: PlatDuJourConfig;
  onChangePlat: (updated: PlatDuJourConfig) => void;
}

export const PlatDuJourPosterStudio: React.FC<PlatDuJourPosterStudioProps> = ({
  plat,
  onChangePlat
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [copiedTeaser, setCopiedTeaser] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewScale, setPreviewScale] = useState<number>(1);

  // Theme palettes configuration
  const themesConfig: Record<PosterTheme, {
    name: string;
    badge: string;
    bgGradient: [string, string, string];
    accentColor: string;
    goldColor: string;
    cardBg: string;
    textColor: string;
    subtextColor: string;
    borderGold: string;
  }> = {
    LUXURY_GOLD: {
      name: 'Luxe Noir & Or Royal',
      badge: '👑 SIGNATURE',
      bgGradient: ['#170A06', '#2A130C', '#0D0503'],
      accentColor: '#FF6B00',
      goldColor: '#F59E0B',
      cardBg: 'rgba(35, 16, 10, 0.85)',
      textColor: '#FFFFFF',
      subtextColor: '#E5D5C5',
      borderGold: '#D97706'
    },
    SAHEL_TERRACOTTA: {
      name: 'Sahélien Ocre & Épices',
      badge: '🏜️ TRADITION',
      bgGradient: ['#3A1208', '#541C0F', '#1F0804'],
      accentColor: '#EA580C',
      goldColor: '#FBBF24',
      cardBg: 'rgba(50, 18, 10, 0.85)',
      textColor: '#FFF7ED',
      subtextColor: '#FED7AA',
      borderGold: '#F59E0B'
    },
    WOOD_FIRE: {
      name: 'Braise & Flamme Vive',
      badge: '🔥 BRAISÉ',
      bgGradient: ['#1C0704', '#3E0D06', '#120302'],
      accentColor: '#EF4444',
      goldColor: '#F59E0B',
      cardBg: 'rgba(40, 10, 8, 0.88)',
      textColor: '#FFFFFF',
      subtextColor: '#FECACA',
      borderGold: '#EF4444'
    },
    MODERN_EMERALD: {
      name: 'Émeraude Impérial & Or',
      badge: '🌿 PRESTIGE',
      bgGradient: ['#042116', '#093A27', '#02150E'],
      accentColor: '#10B981',
      goldColor: '#FBBF24',
      cardBg: 'rgba(4, 40, 26, 0.88)',
      textColor: '#FFFFFF',
      subtextColor: '#A7F3D0',
      borderGold: '#34D399'
    }
  };

  const currentTheme = themesConfig[plat.posterTheme || 'LUXURY_GOLD'];

  // Dimensions based on format
  const getFormatDimensions = (format: PosterFormat) => {
    switch (format) {
      case 'STORY_PORTRAIT':
        return { width: 1080, height: 1920, label: 'Story & Statut WhatsApp (9:16)' };
      case 'BANNER_LANDSCAPE':
        return { width: 1920, height: 1080, label: 'Bannière Paysage (16:9)' };
      case 'SQUARE_POST':
      default:
        return { width: 1080, height: 1080, label: 'Post Carré Instagram & Facebook (1:1)' };
    }
  };

  // Render poster on HTML5 Canvas in High Definition
  const drawPosterCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getFormatDimensions(plat.posterFormat || 'SQUARE_POST');
    canvas.width = width;
    canvas.height = height;

    setIsGeneratingCanvas(true);

    // 1. Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, currentTheme.bgGradient[0]);
    bgGrad.addColorStop(0.5, currentTheme.bgGradient[1]);
    bgGrad.addColorStop(1, currentTheme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background luxury pattern/circles
    ctx.save();
    ctx.strokeStyle = `${currentTheme.goldColor}15`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.1, width * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.9, width * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Decorative Border
    const borderPadding = 36;
    ctx.save();
    ctx.strokeStyle = `${currentTheme.goldColor}40`;
    ctx.lineWidth = 4;
    ctx.strokeRect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2);
    
    // Golden corner accents
    const cornerSize = 40;
    ctx.strokeStyle = currentTheme.goldColor;
    ctx.lineWidth = 6;
    
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(borderPadding, borderPadding + cornerSize);
    ctx.lineTo(borderPadding, borderPadding);
    ctx.lineTo(borderPadding + cornerSize, borderPadding);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - borderPadding - cornerSize, borderPadding);
    ctx.lineTo(width - borderPadding, borderPadding);
    ctx.lineTo(width - borderPadding, borderPadding + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(borderPadding, height - borderPadding - cornerSize);
    ctx.lineTo(borderPadding, height - borderPadding);
    ctx.lineTo(borderPadding + cornerSize, height - borderPadding);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - borderPadding - cornerSize, height - borderPadding);
    ctx.lineTo(width - borderPadding, height - borderPadding);
    ctx.lineTo(width - borderPadding, height - borderPadding - cornerSize);
    ctx.stroke();
    ctx.restore();

    // 3. Top Header: Restaurant Name & Brand
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = currentTheme.goldColor;
    ctx.font = 'bold 30px "Montserrat", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('✦ KHADY\'S FOOD & EVENT ✦', width / 2, borderPadding + 60);

    ctx.fillStyle = currentTheme.subtextColor;
    ctx.font = '500 20px "Inter", sans-serif';
    ctx.fillText('HAUTE GASTRONOMIE SAHÉLIENNE • NIAMEY', width / 2, borderPadding + 95);
    ctx.restore();

    // 4. Timing Badge ("AU MENU DEMAIN MIDI !" or "AU MENU DU JOUR")
    const isEvening = plat.publicationTiming === 'TONIGHT_FOR_TOMORROW';
    const badgeText = isEvening 
      ? `🌙 AU MENU DEMAIN MIDI (${(plat.targetDayLabel || 'DEMAIN').toUpperCase()})`
      : `🍲 PLAT DU JOUR • ${(plat.date || 'AUJOURD\'HUI').toUpperCase()}`;

    const badgeWidth = Math.min(width * 0.75, 680);
    const badgeHeight = 56;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = borderPadding + 125;

    ctx.save();
    // Badge pill
    ctx.fillStyle = isEvening ? '#7C2D12' : currentTheme.accentColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
    ctx.fill();
    ctx.strokeStyle = currentTheme.goldColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Badge text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 22px "Montserrat", sans-serif';
    ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
    ctx.restore();

    // 5. Dish Image (Load & Draw with rounded corners and golden frame)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = plat.dishImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000';

    const drawContent = () => {
      let imgSize = 0;
      let imgX = 0;
      let imgY = 0;

      if (plat.posterFormat === 'STORY_PORTRAIT') {
        imgSize = 720;
        imgX = (width - imgSize) / 2;
        imgY = badgeY + badgeHeight + 40;
      } else if (plat.posterFormat === 'BANNER_LANDSCAPE') {
        imgSize = 600;
        imgX = borderPadding + 60;
        imgY = (height - imgSize) / 2 + 30;
      } else {
        // Square 1:1
        imgSize = 520;
        imgX = (width - imgSize) / 2;
        imgY = badgeY + badgeHeight + 25;
      }

      // Draw Golden image shadow & frame
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 15;

      ctx.beginPath();
      ctx.roundRect(imgX - 6, imgY - 6, imgSize + 12, imgSize + 12, 36);
      ctx.fillStyle = currentTheme.goldColor;
      ctx.fill();

      // Clip image to rounded rectangle
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 32);
      ctx.clip();
      try {
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      } catch (e) {
        ctx.fillStyle = '#2A130C';
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
      }
      ctx.restore();

      // Promotional overlay tag on the dish photo
      ctx.save();
      const tagW = 240;
      const tagH = 46;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(imgX + 20, imgY + 20, tagW, tagH, 14);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 17px "Montserrat", sans-serif';
      ctx.fillText(isEvening ? '⚡ PRÉCOMMANDE SOIR' : '🔥 ÉDITION DU JOUR', imgX + 20 + tagW / 2, imgY + 20 + tagH / 2);
      ctx.restore();

      // 6. Dish Title, Description, and Details
      let textStartX = 0;
      let textStartY = 0;
      let textMaxWidth = 0;

      if (plat.posterFormat === 'BANNER_LANDSCAPE') {
        textStartX = imgX + imgSize + 60;
        textStartY = borderPadding + 140;
        textMaxWidth = width - textStartX - borderPadding - 40;
      } else if (plat.posterFormat === 'STORY_PORTRAIT') {
        textStartX = borderPadding + 40;
        textStartY = imgY + imgSize + 45;
        textMaxWidth = width - (borderPadding + 40) * 2;
      } else {
        // Square 1:1
        textStartX = borderPadding + 40;
        textStartY = imgY + imgSize + 25;
        textMaxWidth = width - (borderPadding + 40) * 2;
      }

      ctx.save();
      ctx.textAlign = plat.posterFormat === 'BANNER_LANDSCAPE' ? 'left' : 'center';
      const textCenterX = plat.posterFormat === 'BANNER_LANDSCAPE' ? textStartX : width / 2;

      // Dish Main Title (wrapped if needed)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 38px "Playfair Display", "Montserrat", serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;

      const titleWords = plat.dishName.toUpperCase().split(' ');
      let line1 = '';
      let line2 = '';
      for (const word of titleWords) {
        if ((line1 + word).length < 24) {
          line1 += (line1 ? ' ' : '') + word;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }

      ctx.fillText(line1, textCenterX, textStartY + 10);
      if (line2) {
        ctx.fillText(line2, textCenterX, textStartY + 55);
        textStartY += 45;
      }

      // Tagline
      ctx.fillStyle = currentTheme.goldColor;
      ctx.font = 'italic 700 20px "Inter", sans-serif';
      ctx.fillText(`« ${plat.tagline || 'Cuisiné au feu de bois avec passion'} »`, textCenterX, textStartY + 50);

      // Bonus / Accompaniments Pill
      if (plat.accompaniments) {
        const bonusY = textStartY + 80;
        const bonusW = Math.min(textMaxWidth, 820);
        const bonusH = 54;
        const bonusX = plat.posterFormat === 'BANNER_LANDSCAPE' ? textStartX : (width - bonusW) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(bonusX, bonusY, bonusW, bonusH, 18);
        ctx.fill();
        ctx.strokeStyle = `${currentTheme.goldColor}60`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = currentTheme.goldColor;
        ctx.font = '900 16px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🎁 INCLUS : ${plat.accompaniments.toUpperCase()}`, bonusX + bonusW / 2, bonusY + 33);
      }

      // Price block & Call to action
      const priceY = textStartY + 165;
      ctx.textAlign = plat.posterFormat === 'BANNER_LANDSCAPE' ? 'left' : 'center';

      // Old price crossed out
      if (plat.promoPrice && plat.promoPrice < plat.price) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '700 24px "Montserrat", sans-serif';
        const oldPriceText = `${plat.price.toLocaleString('fr-FR')} F CFA`;
        const oldPriceX = plat.posterFormat === 'BANNER_LANDSCAPE' ? textStartX : width / 2 - 130;
        ctx.fillText(oldPriceText, oldPriceX, priceY);
        // Strikethrough
        const metrics = ctx.measureText(oldPriceText);
        ctx.fillRect(oldPriceX - (plat.posterFormat === 'BANNER_LANDSCAPE' ? 0 : metrics.width / 2), priceY - 8, metrics.width, 3);
      }

      // Promo Price Highlight
      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = '900 48px "Montserrat", sans-serif';
      const finalPrice = (plat.promoPrice || plat.price).toLocaleString('fr-FR');
      const finalPriceX = plat.posterFormat === 'BANNER_LANDSCAPE' ? (plat.promoPrice ? textStartX + 180 : textStartX) : (plat.promoPrice ? width / 2 + 90 : width / 2);
      ctx.fillText(`${finalPrice} F CFA`, finalPriceX, priceY);

      // Bottom Footer Bar (WhatsApp, Billo Express, Portions)
      const footerY = height - borderPadding - 65;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(borderPadding + 20, footerY - 20, width - (borderPadding + 20) * 2, 70, 22);
      ctx.fill();
      ctx.strokeStyle = `${currentTheme.goldColor}40`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 20px "Montserrat", sans-serif';
      const footerText = isEvening
        ? `📲 RÉSERVEZ CE SOIR PAR WHATSAPP : ${RESTAURANT_INFO.whatsapp} • 🛵 LIVRAISON DÈS 12H PAR BILLO EXPRESS`
        : `📲 COMMANDES WHATSAPP : ${RESTAURANT_INFO.whatsapp} • 🛵 LIVRAISON EXPRESS BILLO (NIAMEY)`;
      
      ctx.fillText(footerText, width / 2, footerY + 24);

      ctx.restore();
      setIsGeneratingCanvas(false);
    };

    img.onload = () => {
      drawContent();
    };

    img.onerror = () => {
      drawContent();
    };
  }, [plat, currentTheme]);

  // Redraw when plat or theme changes
  useEffect(() => {
    drawPosterCanvas();
  }, [drawPosterCanvas]);

  // Download high-resolution PNG image
  const handleDownloadPoster = () => {
    playSound('cash');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    const filename = `affiche-plat-du-jour-${plat.dishName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${plat.posterFormat.toLowerCase()}.png`;
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Copy evening teaser text
  const handleCopyTeaserText = () => {
    playSound('pop');
    navigator.clipboard.writeText(plat.marketingTextEveningTeaser || plat.marketingTextWhatsApp);
    setCopiedTeaser(true);
    setTimeout(() => setCopiedTeaser(false), 2500);
  };

  // Broadcast evening teaser to WhatsApp
  const handleBroadcastEvening = () => {
    playSound('pop');
    const textToSend = plat.publicationTiming === 'TONIGHT_FOR_TOMORROW' 
      ? plat.marketingTextEveningTeaser 
      : plat.marketingTextWhatsApp;
    broadcastToWhatsApp(textToSend);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Studio Hero Header */}
      <div className="bg-gradient-to-r from-[#2A120B] via-[#35180E] to-[#1A0805] p-6 sm:p-8 rounded-[2.5rem] border-2 border-brand-gold/40 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-orange text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
              <Sparkles size={12} /> Studio Graphique & Affiches Réseaux Sociaux
            </span>
            <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-[9px] font-bold px-3 py-0.5 rounded-full">
              Export PNG Haute Résolution 1080p
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-wide flex items-center gap-2.5">
            <ImageIcon className="text-brand-gold" size={26} /> Créateur d'Affiches Alléchantes
          </h3>
          <p className="text-xs text-white/70 font-medium max-w-2xl leading-relaxed">
            Créez en 1 clic une affiche professionnelle alléchante pour le Plat du Jour. Publiez-la **la veille au soir** sur WhatsApp, Facebook et Instagram pour déclencher les précommandes nocturnes avant le rush de midi !
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPoster}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            {downloadSuccess ? <CheckCircle2 size={16} className="text-emerald-200" /> : <Download size={16} />}
            <span>{downloadSuccess ? 'Téléchargé en HD !' : 'Télécharger l\'Affiche PNG HD'}</span>
          </button>

          <button
            type="button"
            onClick={handleBroadcastEvening}
            className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-orange/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Share2 size={16} />
            <span>Diffuser sur WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Creative Controls & Publication Timing (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 1. Publication Timing Selector (Veille au Soir vs Aujourd'hui) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <Clock size={16} className="text-brand-orange" /> 1. Moment de Diffusion & Teasing
              </h4>
              <span className="text-[8px] font-bold text-white/50 uppercase">Stratégie 24h</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  onChangePlat({ ...plat, publicationTiming: 'TONIGHT_FOR_TOMORROW' });
                }}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                  plat.publicationTiming === 'TONIGHT_FOR_TOMORROW'
                    ? 'bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-purple-400 text-white shadow-xl shadow-purple-950/40'
                    : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                    <Moon size={18} />
                  </span>
                  {plat.publicationTiming === 'TONIGHT_FOR_TOMORROW' && (
                    <span className="text-[8px] font-black uppercase bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-white">🌙 La Veille au Soir</p>
                  <p className="text-[9px] text-white/60 mt-0.5 leading-snug">
                    Pour annoncer le menu de demain et ouvrir les précommandes dès 20h.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  onChangePlat({ ...plat, publicationTiming: 'TODAY_LUNCH' });
                }}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                  plat.publicationTiming === 'TODAY_LUNCH'
                    ? 'bg-gradient-to-br from-amber-950/80 to-orange-950/80 border-amber-400 text-white shadow-xl shadow-amber-950/40'
                    : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                    <Sun size={18} />
                  </span>
                  {plat.publicationTiming === 'TODAY_LUNCH' && (
                    <span className="text-[8px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-white">☀️ Le Matin Même</p>
                  <p className="text-[9px] text-white/60 mt-0.5 leading-snug">
                    Pour booster les ventes directes du midi dès 10h30.
                  </p>
                </div>
              </button>
            </div>

            {/* Custom Day Target Label */}
            {plat.publicationTiming === 'TONIGHT_FOR_TOMORROW' && (
              <div className="bg-purple-950/30 p-3.5 rounded-2xl border border-purple-500/20 space-y-1.5 animate-fade-in">
                <label className="text-[9px] font-black uppercase text-purple-300 flex items-center gap-1.5">
                  <ChefHat size={12} /> Intitulé du jour cible sur l'affiche
                </label>
                <div className="flex gap-2">
                  {['Demain Midi', 'Demain Vendredi', 'Demain Samedi', 'Ce Midi'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        playSound('pop');
                        onChangePlat({ ...plat, targetDayLabel: label });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${
                        plat.targetDayLabel === label
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Format Selector (Story 9:16 vs Carré 1:1 vs Bannière 16:9) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
              <Layers size={16} className="text-brand-orange" /> 2. Format de Publication
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'SQUARE_POST', label: 'Post Carré', ratio: '1:1 (1080x1080)', icon: Square, sub: 'Facebook / Instagram' },
                { id: 'STORY_PORTRAIT', label: 'Story & Statut', ratio: '9:16 (1080x1920)', icon: Smartphone, sub: 'WhatsApp / Story' },
                { id: 'BANNER_LANDSCAPE', label: 'Bannière', ratio: '16:9 (1920x1080)', icon: Globe, sub: 'Couverture / Web' }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    onChangePlat({ ...plat, posterFormat: fmt.id as PosterFormat });
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    plat.posterFormat === fmt.id
                      ? 'bg-brand-orange text-white border-brand-orange shadow-lg'
                      : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                >
                  <fmt.icon size={16} className={plat.posterFormat === fmt.id ? 'text-white' : 'text-brand-gold'} />
                  <p className="text-[10px] font-black uppercase mt-1.5 leading-tight">{fmt.label}</p>
                  <p className="text-[8px] opacity-80 mt-0.5">{fmt.ratio}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Graphic Theme Selector (Luxe Noir/Or, Sahélien, Braisé, Émeraude) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
              <Palette size={16} className="text-brand-orange" /> 3. Ambiance & Thème Visuel
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(themesConfig) as PosterTheme[]).map((themeKey) => {
                const th = themesConfig[themeKey];
                const isSelected = (plat.posterTheme || 'LUXURY_GOLD') === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => {
                      playSound('pop');
                      onChangePlat({ ...plat, posterTheme: themeKey });
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-brand-gold shadow-lg ring-2 ring-brand-gold/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${th.bgGradient[0]}, ${th.bgGradient[1]})`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/20">
                        {th.badge}
                      </span>
                      {isSelected && <CheckCircle2 size={14} className="text-brand-gold" />}
                    </div>
                    <p className="text-xs font-black text-white">{th.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Text Teaser de la Veille au Soir (Prêt à Copier & Diffuser) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-orange" /> Texte d'Accompagnement Veille au Soir
              </h4>
              <button
                type="button"
                onClick={handleCopyTeaserText}
                className="text-[9px] font-black text-white/80 hover:text-white uppercase flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
              >
                {copiedTeaser ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedTeaser ? 'Copié !' : 'Copier Texte'}</span>
              </button>
            </div>

            <textarea
              rows={7}
              value={plat.marketingTextEveningTeaser || plat.marketingTextWhatsApp}
              onChange={(e) => onChangePlat({ ...plat, marketingTextEveningTeaser: e.target.value })}
              className="w-full bg-[#120B09] border border-white/15 rounded-2xl p-4 text-xs font-mono text-white/90 focus:outline-none focus:border-brand-gold leading-relaxed resize-none shadow-inner"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => broadcastToWhatsApp(plat.marketingTextEveningTeaser || plat.marketingTextWhatsApp)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Smartphone size={13} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(plat.marketingTextEveningTeaser || plat.marketingTextSocial, 'facebook')}
                className="bg-[#1877F2] hover:bg-blue-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Facebook size={13} /> Facebook
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(plat.marketingTextEveningTeaser || plat.marketingTextSocial, 'instagram')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-90 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Instagram size={13} /> Instagram
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(plat.marketingTextEveningTeaser || plat.marketingTextSocial, 'tiktok')}
                className="bg-black hover:bg-zinc-800 border border-white/20 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Music size={13} className="text-cyan-400" /> TikTok
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live HD Canvas Poster Preview & Export Hub (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6 flex flex-col items-center">
            
            {/* Header with Dimensions & Refresh */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-brand-gold flex items-center gap-1.5">
                  <Eye size={14} /> Rendu Graphique Haute Définition
                </span>
                <p className="text-[10px] text-white/60 font-bold">
                  {getFormatDimensions(plat.posterFormat || 'SQUARE_POST').label}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={drawPosterCanvas}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <RefreshCw size={12} className={isGeneratingCanvas ? 'animate-spin' : ''} />
                  <span>Actualiser</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Download size={14} />
                  <span>Télécharger PNG</span>
                </button>
              </div>
            </div>

            {/* Live Canvas View Container (Scaled cleanly to fit screen) */}
            <div className="w-full flex justify-center items-center py-2 overflow-hidden bg-black/40 rounded-3xl p-4 border border-white/5 shadow-inner">
              <div 
                className="relative shadow-2xl rounded-2xl overflow-hidden border-2 border-brand-gold/30 transition-all duration-300"
                style={{
                  maxWidth: plat.posterFormat === 'STORY_PORTRAIT' ? '380px' : plat.posterFormat === 'BANNER_LANDSCAPE' ? '650px' : '480px',
                  width: '100%'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block rounded-2xl"
                />
              </div>
            </div>

            {/* Poster Publication Advice Box */}
            <div className="w-full bg-gradient-to-r from-amber-950/40 via-brand-brown/40 to-black/40 p-5 rounded-2xl border border-brand-gold/20 flex items-start gap-4">
              <div className="p-2.5 bg-brand-orange/20 text-brand-orange rounded-2xl shrink-0 mt-0.5">
                <ChefHat size={22} />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-black uppercase text-brand-gold">
                  💡 Conseil Marketing de Cheffe Khady pour la Veille au Soir :
                </h5>
                <p className="text-[10px] text-white/80 leading-relaxed">
                  Publiez cette affiche sur vos **Statuts WhatsApp et Stories Facebook / Instagram entre 20h00 et 22h30**. C'est le créneau idéal où les clients consultent leur téléphone avant de dormir et planifient leur déjeuner du lendemain midi au bureau.
                </p>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPoster}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>Télécharger l'Image PNG (HD 1080p)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  handleCopyTeaserText();
                  broadcastToWhatsApp(plat.marketingTextEveningTeaser || plat.marketingTextWhatsApp);
                }}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={18} />
                <span>Publier Image + Texte WhatsApp</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
