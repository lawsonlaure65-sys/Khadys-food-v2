import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Share2, Sparkles, Moon, Sun, Smartphone, Square, 
  Image as ImageIcon, Check, Copy, RefreshCw, Eye, Flame, 
  ChefHat, Award, Clock, Gift, ShoppingBag, ShieldCheck, 
  MessageSquare, Globe, ArrowRight, Palette, Layers, CheckCircle2,
  Music, Facebook, Instagram, AlertCircle, Send, Info, Edit3
} from 'lucide-react';
import { 
  PlatDuJourConfig, PosterTheme, PosterFormat, PublicationTiming, 
  shareToSocialPlatform, broadcastToWhatsApp, shareImageAndText 
} from '../utils/marketing';
import { RESTAURANT_INFO } from '../constants';
import { playSound } from '../utils/audio';
import { MenuItem } from '../types';

interface PlatDuJourPosterStudioProps {
  plat: PlatDuJourConfig;
  items?: MenuItem[];
  onSwitchToRecipeTab?: () => void;
  onChangePlat: (updated: PlatDuJourConfig) => void;
}

export const PlatDuJourPosterStudio: React.FC<PlatDuJourPosterStudioProps> = ({
  plat,
  items,
  onSwitchToRecipeTab,
  onChangePlat
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [copiedTeaser, setCopiedTeaser] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  // Toggle between Short Status Format (< 7 lines for WhatsApp Status) and Full Text Format
  const [textMode, setTextMode] = useState<'SHORT_STATUS' | 'FULL_TEASER'>('SHORT_STATUS');

  // Theme palettes configuration
  const themesConfig: Record<PosterTheme, {
    name: string;
    badge: string;
    isLightSand?: boolean;
    bgGradient: [string, string, string];
    accentColor: string;
    goldColor: string;
    cardBg: string;
    textColor: string;
    subtextColor: string;
    borderGold: string;
    bannerBg: string;
    bannerTextColor: string;
  }> = {
    SAHEL_TERRACOTTA: {
      name: 'Sahélien Ocre & Crème (Style Samalife)',
      badge: '⭐ RECOMMANDÉ',
      isLightSand: true,
      bgGradient: ['#FAF5EE', '#F3E7D7', '#EBDAC5'],
      accentColor: '#EA580C',
      goldColor: '#C2410C',
      cardBg: '#FFFFFF',
      textColor: '#3A1408',
      subtextColor: '#7C2D12',
      borderGold: '#EA580C',
      bannerBg: '#EA580C',
      bannerTextColor: '#FFFFFF'
    },
    LUXURY_GOLD: {
      name: 'Luxe Noir & Or Royal',
      badge: '👑 SIGNATURE',
      isLightSand: false,
      bgGradient: ['#170A06', '#2A130C', '#0D0503'],
      accentColor: '#FF6B00',
      goldColor: '#F59E0B',
      cardBg: 'rgba(35, 16, 10, 0.85)',
      textColor: '#FFFFFF',
      subtextColor: '#E5D5C5',
      borderGold: '#D97706',
      bannerBg: '#FF6B00',
      bannerTextColor: '#FFFFFF'
    },
    WOOD_FIRE: {
      name: 'Braise & Flamme Vive',
      badge: '🔥 BRAISÉ',
      isLightSand: false,
      bgGradient: ['#1C0704', '#3E0D06', '#120302'],
      accentColor: '#EF4444',
      goldColor: '#F59E0B',
      cardBg: 'rgba(40, 10, 8, 0.88)',
      textColor: '#FFFFFF',
      subtextColor: '#FECACA',
      borderGold: '#EF4444',
      bannerBg: '#DC2626',
      bannerTextColor: '#FFFFFF'
    },
    MODERN_EMERALD: {
      name: 'Émeraude Impérial & Or',
      badge: '🌿 PRESTIGE',
      isLightSand: false,
      bgGradient: ['#042116', '#093A27', '#02150E'],
      accentColor: '#10B981',
      goldColor: '#FBBF24',
      cardBg: 'rgba(4, 40, 26, 0.88)',
      textColor: '#FFFFFF',
      subtextColor: '#A7F3D0',
      borderGold: '#34D399',
      bannerBg: '#059669',
      bannerTextColor: '#FFFFFF'
    }
  };

  const currentTheme = themesConfig[plat.posterTheme || 'SAHEL_TERRACOTTA'] || themesConfig.SAHEL_TERRACOTTA;

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

  // Get active text based on selected mode & timing
  const getActiveTextToShare = () => {
    const isEvening = plat.publicationTiming === 'TONIGHT_FOR_TOMORROW';
    if (textMode === 'SHORT_STATUS') {
      if (isEvening) {
        return plat.marketingTextEveningStatusShort || 
          `🌙 *AU MENU DEMAIN MIDI !* 🍲✨\n👑 *${plat.dishName.toUpperCase()}*\n🎁 ${plat.accompaniments || 'Alloco + Jus Bissap 50cl offert'}\n💰 *${(plat.promoPrice || plat.price || 4500).toLocaleString('fr-FR')} F CFA* • Livré dès 12h par Billo\n👉 Réservez ce soir : ${RESTAURANT_INFO.whatsapp}`;
      } else {
        return plat.marketingTextStatusShort || 
          `🍲 *PLAT DU JOUR • KHADY'S FOOD* 🍲\n👑 *${plat.dishName.toUpperCase()}*\n🎁 ${plat.accompaniments || 'Alloco doré + Jus Bissap 50cl offert'}\n💰 *${(plat.promoPrice || plat.price || 4500).toLocaleString('fr-FR')} F CFA*\n🛵 Livré dès 12h par Billo Express\n👉 Commandez au ${RESTAURANT_INFO.whatsapp}`;
      }
    } else {
      return isEvening ? (plat.marketingTextEveningTeaser || plat.marketingTextWhatsApp) : plat.marketingTextWhatsApp;
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

    const isLight = !!currentTheme.isLightSand;
    const isEvening = plat.publicationTiming === 'TONIGHT_FOR_TOMORROW';

    // 1. Draw Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, currentTheme.bgGradient[0]);
    bgGrad.addColorStop(0.5, currentTheme.bgGradient[1]);
    bgGrad.addColorStop(1, currentTheme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle luxury background circles / mandalas
    ctx.save();
    ctx.strokeStyle = isLight ? 'rgba(234, 88, 12, 0.08)' : `${currentTheme.goldColor}15`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width * 0.88, height * 0.12, width * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width * 0.12, height * 0.88, width * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Decorative Outer Border
    const borderPadding = 32;
    ctx.save();
    ctx.strokeStyle = isLight ? 'rgba(194, 65, 12, 0.25)' : `${currentTheme.goldColor}40`;
    ctx.lineWidth = 3;
    ctx.strokeRect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2);
    
    // Golden corner flourishes
    const cornerSize = 36;
    ctx.strokeStyle = isLight ? '#EA580C' : currentTheme.goldColor;
    ctx.lineWidth = 5;
    
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

    // 3. Top Header: Circular Restaurant Emblem & Brand Name (Style Samalife)
    ctx.save();
    const emblemY = borderPadding + 55;
    
    // Round Logo badge
    ctx.beginPath();
    ctx.arc(width / 2, emblemY, 32, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? '#FFFFFF' : '#2A130C';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#EA580C' : currentTheme.goldColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Chef / Fork Icon Monogram
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isLight ? '#EA580C' : currentTheme.goldColor;
    ctx.font = '900 24px sans-serif';
    ctx.fillText('👑', width / 2, emblemY - 2);

    // Restaurant Name
    ctx.fillStyle = isLight ? '#431407' : currentTheme.goldColor;
    ctx.font = 'bold 24px "Montserrat", sans-serif';
    ctx.fillText('✦ KHADY\'S FOOD & EVENT ✦', width / 2, emblemY + 52);

    // Subtitle
    ctx.fillStyle = isLight ? '#9A3412' : currentTheme.subtextColor;
    ctx.font = '600 15px "Inter", sans-serif';
    ctx.fillText('AUTHENTIQUE GASTRONOMIE SAHÉLIENNE • NIAMEY', width / 2, emblemY + 76);
    ctx.restore();

    // 4. Timing Ribbon Badge ("🌙 AU MENU DEMAIN MIDI" or "🍲 PLAT DU JOUR")
    const badgeText = isEvening 
      ? `🌙 AU MENU DEMAIN MIDI (${(plat.targetDayLabel || 'DEMAIN').toUpperCase()})`
      : `🍲 PLAT DU JOUR • ${(plat.date || 'AUJOURD\'HUI').toUpperCase()}`;

    const badgeWidth = Math.min(width * 0.72, 620);
    const badgeHeight = 50;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = emblemY + 98;

    ctx.save();
    ctx.fillStyle = isEvening ? '#7C2D12' : currentTheme.accentColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
    ctx.fill();
    ctx.strokeStyle = isLight ? '#FED7AA' : currentTheme.goldColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 20px "Montserrat", sans-serif';
    ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
    ctx.restore();

    // 5. Dish Title & Tagline (Positioned above or below image based on format)
    const isPortrait = plat.posterFormat === 'STORY_PORTRAIT';
    const isLandscape = plat.posterFormat === 'BANNER_LANDSCAPE';

    // 6. Dish Image (Load & Draw with circular plate shadow)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = plat.dishImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000';

    const drawContent = () => {
      let imgSize = 0;
      let imgX = 0;
      let imgY = 0;

      if (isPortrait) {
        imgSize = 640;
        imgX = (width - imgSize) / 2;
        imgY = badgeY + badgeHeight + 35;
      } else if (isLandscape) {
        imgSize = 580;
        imgX = borderPadding + 60;
        imgY = (height - imgSize) / 2 + 30;
      } else {
        // Square 1:1
        imgSize = 480;
        imgX = (width - imgSize) / 2;
        imgY = badgeY + badgeHeight + 25;
      }

      // Draw Circular Dish Shadow & Raffia/Gold Ring
      ctx.save();
      const centerX = imgX + imgSize / 2;
      const centerY = imgY + imgSize / 2;
      const radius = imgSize / 2;

      // Realistic deep shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 14;

      // Outer braided plate rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#F59E0B' : currentTheme.goldColor;
      ctx.fill();

      // Clip image to perfect circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      try {
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      } catch (e) {
        ctx.fillStyle = isLight ? '#FDE68A' : '#2A130C';
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
      }
      ctx.restore();

      // Tag badge over the dish
      ctx.save();
      const tagW = 220;
      const tagH = 42;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(centerX - tagW / 2, imgY + imgSize - 30, tagW, tagH, 21);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 15px "Montserrat", sans-serif';
      ctx.fillText(isEvening ? '🌙 PRÉCOMMANDE VEILLE' : '🔥 ÉDITION DU JOUR', centerX, imgY + imgSize - 30 + tagH / 2);
      ctx.restore();

      // 7. Dish Title & Details
      let textStartX = 0;
      let textStartY = 0;
      let textMaxWidth = 0;

      if (isLandscape) {
        textStartX = imgX + imgSize + 50;
        textStartY = borderPadding + 140;
        textMaxWidth = width - textStartX - borderPadding - 40;
      } else if (isPortrait) {
        textStartX = borderPadding + 30;
        textStartY = imgY + imgSize + 35;
        textMaxWidth = width - (borderPadding + 30) * 2;
      } else {
        // Square 1:1
        textStartX = borderPadding + 30;
        textStartY = imgY + imgSize + 25;
        textMaxWidth = width - (borderPadding + 30) * 2;
      }

      ctx.save();
      ctx.textAlign = isLandscape ? 'left' : 'center';
      const textCenterX = isLandscape ? textStartX : width / 2;

      // Dish Title (High contrast & elegant typography)
      ctx.fillStyle = isLight ? '#3A1208' : '#FFFFFF';
      ctx.font = '900 36px "Playfair Display", "Montserrat", serif';
      ctx.shadowColor = isLight ? 'rgba(234, 88, 12, 0.15)' : 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;

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

      ctx.fillText(line1, textCenterX, textStartY + 15);
      if (line2) {
        ctx.fillText(line2, textCenterX, textStartY + 55);
        textStartY += 40;
      }

      // Tagline with diamond ornaments
      ctx.fillStyle = isLight ? '#C2410C' : currentTheme.goldColor;
      ctx.font = 'italic 700 18px "Inter", sans-serif';
      ctx.fillText(`◆ ${plat.tagline || 'Cuisiné au feu de bois avec passion'} ◆`, textCenterX, textStartY + 50);

      // Bonus / Accompaniments Pill
      if (plat.accompaniments) {
        const bonusY = textStartY + 72;
        const bonusW = Math.min(textMaxWidth, 780);
        const bonusH = 48;
        const bonusX = isLandscape ? textStartX : (width - bonusW) / 2;

        ctx.fillStyle = isLight ? '#FFFBEB' : 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(bonusX, bonusY, bonusW, bonusH, 16);
        ctx.fill();
        ctx.strokeStyle = isLight ? '#F59E0B' : `${currentTheme.goldColor}60`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isLight ? '#B45309' : currentTheme.goldColor;
        ctx.font = '900 15px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🎁 INCLUS : ${plat.accompaniments.toUpperCase()}`, bonusX + bonusW / 2, bonusY + 30);
      }

      // 8. Solid Bottom Call-to-Action Bar (Style Samalife)
      const barH = 100;
      const barY = height - borderPadding - barH - 8;
      const barW = width - (borderPadding + 16) * 2;
      const barX = borderPadding + 16;

      ctx.save();
      // Orange/Terracotta CTA banner
      ctx.fillStyle = currentTheme.bannerBg;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 24);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Left Column inside bar: WhatsApp Ordering Info
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 17px "Montserrat", sans-serif';
      ctx.fillText(`💬 COMMANDES WHATSAPP : ${RESTAURANT_INFO.whatsapp}`, barX + 24, barY + 35);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '700 13px "Inter", sans-serif';
      ctx.fillText(`🛵 Livraison express partout à Niamey par Billo Express`, barX + 24, barY + 68);

      // Right Column inside bar: Price Tag & White Pill Button
      const finalPriceStr = `${(plat.promoPrice || plat.price).toLocaleString('fr-FR')} F CFA`;
      const btnW = 210;
      const btnH = 58;
      const btnX = barX + barW - btnW - 20;
      const btnY = barY + (barH - btnH) / 2;

      // Button Pill
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 29);
      ctx.fill();

      // Button text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentTheme.bannerBg;
      ctx.font = '900 16px "Montserrat", sans-serif';
      ctx.fillText(finalPriceStr, btnX + btnW / 2, btnY + 22);

      ctx.font = '800 11px "Montserrat", sans-serif';
      ctx.fillStyle = '#7C2D12';
      ctx.fillText('COMMANDER MAINTENANT', btnX + btnW / 2, btnY + 40);

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

  // Copy active teaser/status text
  const handleCopyActiveText = () => {
    playSound('pop');
    const textToCopy = getActiveTextToShare();
    navigator.clipboard.writeText(textToCopy);
    setCopiedTeaser(true);
    setTimeout(() => setCopiedTeaser(false), 2500);
  };

  // Direct Image & Text Native Web Share (solves WhatsApp status & attachment issue)
  const handleShareImageAndTextDirect = async () => {
    playSound('pop');
    setIsSharing(true);
    setShareStatus('Préparation de l\'affiche haute définition...');

    const textToShare = getActiveTextToShare();
    const filename = `khadys-plat-du-jour-${plat.dishName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

    try {
      const res = await shareImageAndText(
        canvasRef.current,
        `Plat du Jour : ${plat.dishName} - Khady's Food`,
        textToShare,
        filename
      );

      setShareStatus(res.message);
      if (res.success) {
        playSound('success');
      }
    } catch (e: any) {
      setShareStatus('Erreur lors du partage.');
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareStatus(null), 8000);
    }
  };

  // Standard WhatsApp Web Broadcast
  const handleBroadcastWhatsApp = () => {
    playSound('pop');
    const textToSend = getActiveTextToShare();
    broadcastToWhatsApp(textToSend);
  };

  const activeText = getActiveTextToShare();
  const textLineCount = activeText.split('\n').length;
  const textCharCount = activeText.length;
  const isStatusSafe = textLineCount <= 8 && textCharCount <= 400;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Studio Hero Header */}
      <div className="bg-gradient-to-r from-[#2A120B] via-[#35180E] to-[#1A0805] p-6 sm:p-8 rounded-[2.5rem] border-2 border-brand-gold/40 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-orange text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
              <Sparkles size={12} /> Studio Graphique & Affiches Réseaux Sociaux
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={11} /> Format WhatsApp Statut Garanti
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-wide flex items-center gap-2.5">
            <ImageIcon className="text-brand-gold" size={26} /> Créateur d'Affiches Alléchantes & Partage Direct
          </h3>
          <p className="text-xs text-white/70 font-medium max-w-2xl leading-relaxed">
            Créez une affiche de haute qualité (style Samalife), téléchargez l'image PNG et partagez le texte adapté aux **Statuts WhatsApp** (sans risque de coupure ou dépassement de 700 caractères).
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShareImageAndTextDirect}
            disabled={isSharing}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            {isSharing ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            <span>📲 Partager Affiche + Texte Direct</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPoster}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center gap-2"
          >
            {downloadSuccess ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Download size={16} />}
            <span>{downloadSuccess ? 'Téléchargé !' : 'Télécharger PNG HD'}</span>
          </button>
        </div>
      </div>

      {/* Share Status Toast / Notification Banner */}
      {shareStatus && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/60 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-xs font-bold text-white leading-snug">
              {shareStatus}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShareStatus(null)}
            className="text-white/60 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Workspace: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Creative Controls & Publication Timing (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Active Dish Quick-Card with Direct Switch to 100% Custom Edition */}
          <div className="bg-gradient-to-r from-brand-orange/20 via-brand-gold/15 to-transparent p-5 rounded-[2rem] border-2 border-brand-gold/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                <ChefHat size={14} className="text-brand-orange" /> Plat Actif sur l'Affiche
              </span>
              <span className="text-[9px] font-mono font-black text-white bg-brand-orange/40 px-2 py-0.5 rounded-full border border-brand-orange/40">
                {(plat.promoPrice || plat.price || 4500).toLocaleString('fr-FR')} F CFA
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={plat.dishImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                alt={plat.dishName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-gold/40 shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white truncate">
                  {plat.dishName}
                </h4>
                <p className="text-[10px] text-white/60 line-clamp-1">
                  {plat.tagline || plat.description}
                </p>
                <p className="text-[9px] font-bold text-brand-gold mt-0.5">
                  📅 {plat.targetDayLabel || 'Demain Midi'}
                </p>
              </div>
            </div>

            {/* Direct Button to 100% Custom Edition Form */}
            {onSwitchToRecipeTab && (
              <button
                type="button"
                onClick={onSwitchToRecipeTab}
                className="w-full bg-brand-gold hover:bg-amber-400 text-brand-brown py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Edit3 size={13} />
                <span>✍️ Modifier la Recette, Photo, Prix & Ingrédients ➔</span>
              </button>
            )}
          </div>

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
                <div className="flex flex-wrap gap-2">
                  {['Demain Midi', 'Demain Vendredi', 'Demain Samedi', 'Demain Dimanche', 'Ce Midi'].map((label) => (
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

          {/* 3. Graphic Theme Selector (Luxe Noir/Or, Sahélien Ocre, Braisé, Émeraude) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
              <Palette size={16} className="text-brand-orange" /> 3. Ambiance & Thème Graphique
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(themesConfig) as PosterTheme[]).map((themeKey) => {
                const th = themesConfig[themeKey];
                const isSelected = (plat.posterTheme || 'SAHEL_TERRACOTTA') === themeKey;
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
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        th.isLightSand ? 'bg-orange-600 text-white' : 'bg-black/40 text-white'
                      }`}>
                        {th.badge}
                      </span>
                      {isSelected && <CheckCircle2 size={14} className={th.isLightSand ? 'text-orange-600' : 'text-brand-gold'} />}
                    </div>
                    <p className={`text-xs font-black ${th.isLightSand ? 'text-amber-950' : 'text-white'}`}>{th.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Text Format Switcher (Format Court Spécial Statut vs Format Long) */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-orange" /> 4. Texte de Diffusion WhatsApp
              </h4>
              <button
                type="button"
                onClick={handleCopyActiveText}
                className="text-[9px] font-black text-white/80 hover:text-white uppercase flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
              >
                {copiedTeaser ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedTeaser ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            {/* Toggle tabs for Short vs Full */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  setTextMode('SHORT_STATUS');
                }}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  textMode === 'SHORT_STATUS'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                <span>Format Court (Statut &lt; 7 lignes)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('pop');
                  setTextMode('FULL_TEASER');
                }}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  textMode === 'FULL_TEASER'
                    ? 'bg-brand-orange text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <MessageSquare size={13} />
                <span>Format Long (Groupes)</span>
              </button>
            </div>

            {/* Validation Indicator */}
            <div className="flex items-center justify-between text-[10px] px-1">
              <span className={`font-bold flex items-center gap-1 ${isStatusSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isStatusSafe ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {isStatusSafe ? 'Parfait pour Statut WhatsApp (< 700 car.)' : 'Texte long : idéal pour Groupes WhatsApp'}
              </span>
              <span className="font-mono text-white/50 text-[9px]">
                {textLineCount} lignes • {textCharCount} car.
              </span>
            </div>

            <textarea
              rows={textMode === 'SHORT_STATUS' ? 6 : 9}
              value={activeText}
              onChange={(e) => {
                const val = e.target.value;
                const isEvening = plat.publicationTiming === 'TONIGHT_FOR_TOMORROW';
                if (textMode === 'SHORT_STATUS') {
                  if (isEvening) {
                    onChangePlat({ ...plat, marketingTextEveningStatusShort: val });
                  } else {
                    onChangePlat({ ...plat, marketingTextStatusShort: val });
                  }
                } else {
                  if (isEvening) {
                    onChangePlat({ ...plat, marketingTextEveningTeaser: val });
                  } else {
                    onChangePlat({ ...plat, marketingTextWhatsApp: val });
                  }
                }
              }}
              className="w-full bg-[#120B09] border border-white/15 rounded-2xl p-4 text-xs font-mono text-white/90 focus:outline-none focus:border-brand-gold leading-relaxed resize-none shadow-inner"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleBroadcastWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Smartphone size={13} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(activeText, 'facebook')}
                className="bg-[#1877F2] hover:bg-blue-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Facebook size={13} /> Facebook
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(activeText, 'instagram')}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-90 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Instagram size={13} /> Instagram
              </button>
              <button
                type="button"
                onClick={() => shareToSocialPlatform(activeText, 'tiktok')}
                className="bg-black hover:bg-zinc-800 border border-white/20 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Music size={13} className="text-cyan-400" /> TikTok
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live HD Canvas Poster Preview & Direct Share Hub (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6 flex flex-col items-center">
            
            {/* Header with Dimensions & Refresh */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-brand-gold flex items-center gap-1.5">
                  <Eye size={14} /> Rendu Graphique HD
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

            {/* Step by Step Guide for WhatsApp Status */}
            <div className="w-full bg-gradient-to-r from-emerald-950/40 via-brand-brown/40 to-black/40 p-5 rounded-2xl border border-emerald-500/30 flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl shrink-0 mt-0.5">
                <Info size={22} />
              </div>
              <div className="space-y-1.5">
                <h5 className="text-xs font-black uppercase text-emerald-300">
                  📱 Comment publier l'affiche &amp; le texte sur votre Statut WhatsApp :
                </h5>
                <ol className="text-[10px] text-white/80 leading-relaxed list-decimal list-inside space-y-1">
                  <li>Cliquez sur **« Partager Affiche + Texte Direct »** ci-dessous pour ouvrir directement WhatsApp sur mobile.</li>
                  <li>Sur ordinateur : Téléchargez l'affiche PNG puis copiez le texte en 1 clic.</li>
                  <li>Sélectionnez l'image dans votre Statut WhatsApp et collez le texte en légende !</li>
                </ol>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleShareImageAndTextDirect}
                disabled={isSharing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSharing ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                <span>Partager Affiche + Texte Direct</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPoster}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>Télécharger l'Image PNG HD</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
