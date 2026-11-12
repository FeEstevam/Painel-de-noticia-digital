import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Image as ImageIcon,
  FileText,
  Zap,
  Search,
  Timer,
  Upload,
  X,
  CloudSun,
  Radio,
  MapPin,
  Globe,
  Sparkles,
  Calendar,
  CalendarDays,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

/**
 * Redimensiona e comprime uma foto da galeria para manter o carregamento instantâneo
 * e economizar espaço de armazenamento no banco de dados.
 */
function optimizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Gera Data URL comprimido em JPEG de alta qualidade
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve(optimizedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const POPULAR_CITIES = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Brasília, DF',
  'Curitiba, PR',
  'Belo Horizonte, MG',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Recife, PE',
  'Fortaleza, CE'
];

/**
 * Retorna string mínima no formato YYYY-MM-DDTHH:mm para inputs de datetime
 */
function getCurrentDateTimeString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

/**
 * Formata um timestamp para data e hora brasileira
 */
function formatDateTime(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Retorna texto relativo amigável de tempo
 */
function getRelativeTimeDescription(targetTs, isFuture = true) {
  if (!targetTs) return '';
  const diff = isFuture ? targetTs - Date.now() : Date.now() - targetTs;
  if (diff <= 0) return 'agora';

  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} dia(s) e ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function NewsManager({ newsList, onAddNews, onUpdateNews, onDeleteNews }) {
  const [formData, setFormData] = useState({
    type: 'text', // 'text', 'image', 'weather', 'feed'
    title: '',
    content: '',
    imageUrl: '',
    category: 'Geral',
    slideDuration: '5', // Tempo em segundos no carrossel
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    feedCategory: 'geral',
    // Agendamento antecipado de início
    startType: 'now', // 'now' ou 'scheduled'
    publishAtDateTime: '',
    // Término / Validade
    endType: 'never', // 'never', 'duration', 'datetime'
    durationMinutes: '60',
    expiresAtDateTime: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'live', 'scheduled', 'expired'
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const now = Date.now();

  // Inicia o modo de edição para um item existente
  const handleStartEdit = (item) => {
    setEditingId(item.id);

    const publishAtDate = item.publishAt ? new Date(item.publishAt) : null;
    const expiresAtDate = item.expiresAt ? new Date(item.expiresAt) : null;

    setFormData({
      type: item.type || 'text',
      title: item.title || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      category: item.category || 'Geral',
      slideDuration: String(item.slideDuration || 5),
      gradient: item.bgColor || 'from-indigo-600 via-purple-600 to-pink-600',
      feedCategory: item.type === 'feed' ? (item.category || 'geral') : 'geral',
      startType: publishAtDate ? 'scheduled' : 'now',
      publishAtDateTime: publishAtDate ? publishAtDate.toISOString().slice(0, 16) : '',
      endType: expiresAtDate ? 'datetime' : 'never',
      durationMinutes: '60',
      expiresAtDateTime: expiresAtDate ? expiresAtDate.toISOString().slice(0, 16) : ''
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Cancela a edição e restaura o formulário
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      type: 'text',
      title: '',
      content: '',
      imageUrl: '',
      category: 'Geral',
      slideDuration: '5',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600',
      feedCategory: 'geral',
      startType: 'now',
      publishAtDateTime: '',
      endType: 'never',
      durationMinutes: '60',
      expiresAtDateTime: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Muda o tipo da cena e ajusta padrões inteligentes
  const handleTypeChange = (newType) => {
    setFormData((prev) => {
      let defaultTitle = prev.title;
      let defaultCategory = prev.category;
      let defaultGradient = prev.gradient;

      if (newType === 'weather') {
        defaultTitle = prev.title && prev.title !== 'Reunião Geral' ? prev.title : 'São Paulo, SP';
        defaultCategory = 'Clima & Tempo';
        defaultGradient = 'from-sky-600 via-blue-700 to-indigo-950';
      } else if (newType === 'feed') {
        defaultTitle = 'Giro de Notícias em Tempo Real';
        defaultCategory = 'Notícias ao Vivo';
        defaultGradient = 'from-rose-800 via-red-900 to-neutral-950';
      } else if (newType === 'text') {
        defaultCategory = prev.category === 'Clima & Tempo' || prev.category === 'Notícias ao Vivo' ? 'Geral' : prev.category;
        defaultGradient = 'from-indigo-600 via-purple-600 to-pink-600';
      }

      return {
        ...prev,
        type: newType,
        title: defaultTitle,
        category: defaultCategory,
        gradient: defaultGradient
      };
    });
  };

  // Dispara a leitura e compressão da foto selecionada da galeria do celular
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsProcessingImage(true);
      const optimizedBase64 = await optimizeImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: optimizedBase64 }));
    } catch (err) {
      console.error('Erro ao processar imagem da galeria:', err);
      alert('Erro ao carregar a foto. Tente outra imagem.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let titleToSave = formData.title.trim();
    if (formData.type === 'weather' && !titleToSave) {
      titleToSave = 'São Paulo, SP';
    } else if (formData.type === 'feed' && !titleToSave) {
      titleToSave = 'Notícias em Geral';
    }

    if (!titleToSave) {
      alert('Por favor, informe o título da notícia ou a localidade da cena.');
      return;
    }

    if (formData.type === 'image' && !formData.imageUrl.trim()) {
      alert('Por favor, selecione uma foto da galeria para esta notícia.');
      return;
    }

    // Calcula timestamp de Início (Agendamento Antecipado)
    let publishAt = null;
    if (formData.startType === 'scheduled') {
      if (!formData.publishAtDateTime) {
        alert('Por favor, selecione a data e o horário em que a notícia entrará no ar.');
        return;
      }
      publishAt = new Date(formData.publishAtDateTime).getTime();
    }

    // Calcula timestamp de Término (Expiração)
    let expiresAt = null;
    if (formData.endType === 'datetime') {
      if (!formData.expiresAtDateTime) {
        alert('Por favor, selecione a data e o horário de encerramento da exibição.');
        return;
      }
      expiresAt = new Date(formData.expiresAtDateTime).getTime();
    } else if (formData.endType === 'duration') {
      const minutes = parseInt(formData.durationMinutes, 10);
      const baseTime = publishAt && publishAt > Date.now() ? publishAt : Date.now();
      expiresAt = minutes > 0 ? baseTime + minutes * 60 * 1000 : null;
    }

    // Valida consistência de datas
    if (publishAt && expiresAt && expiresAt <= publishAt) {
      alert('A data de término deve ser posterior à data de início da exibição.');
      return;
    }

    const slideDuration = Math.max(2, parseInt(formData.slideDuration, 10) || 5);

    const newsPayload = {
      id: editingId ? String(editingId) : Date.now().toString(),
      type: formData.type,
      title: titleToSave,
      content: formData.content,
      imageUrl: formData.imageUrl,
      category: formData.type === 'weather' ? 'Clima & Tempo' : formData.type === 'feed' ? formData.feedCategory : (formData.category || 'Geral'),
      slideDuration,
      publishAt,
      expiresAt,
      createdAt: Date.now(),
      bgColor: formData.gradient
    };

    if (editingId && onUpdateNews) {
      onUpdateNews(editingId, newsPayload);
      setEditingId(null);
    } else {
      onAddNews(newsPayload);
    }

    // Resetar formulário
    handleCancelEdit();
  };

  // Classifica o estado de cada notícia
  const getItemStatus = (item) => {
    const publishAtMs = item.publishAt ? new Date(item.publishAt).getTime() : null;
    const expiresAtMs = item.expiresAt ? new Date(item.expiresAt).getTime() : null;

    if (publishAtMs && publishAtMs > now) {
      return {
        type: 'scheduled',
        label: 'Agendada',
        colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        detail: `Entra no ar em ${formatDateTime(publishAtMs)} (${getRelativeTimeDescription(publishAtMs, true)})`
      };
    }
    if (expiresAtMs && expiresAtMs <= now) {
      return {
        type: 'expired',
        label: 'Expirada',
        colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        detail: `Expirou em ${formatDateTime(expiresAtMs)}`
      };
    }
    return {
      type: 'live',
      label: 'No Ar',
      colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      detail: expiresAtMs
        ? `No ar até ${formatDateTime(expiresAtMs)} (restam ${getRelativeTimeDescription(expiresAtMs, true)})`
        : 'No ar • Exibição contínua'
    };
  };

  // Contagens para os filtros
  const liveCount = newsList.filter((n) => {
    const s = getItemStatus(n);
    return s.type === 'live';
  }).length;

  const scheduledCount = newsList.filter((n) => {
    const s = getItemStatus(n);
    return s.type === 'scheduled';
  }).length;

  const expiredCount = newsList.filter((n) => {
    const s = getItemStatus(n);
    return s.type === 'expired';
  }).length;

  // Filtragem da lista
  const filteredNews = newsList.filter((item) => {
    const itemStatus = getItemStatus(item);

    if (statusFilter === 'live' && itemStatus.type !== 'live') return false;
    if (statusFilter === 'scheduled' && itemStatus.type !== 'scheduled') return false;
    if (statusFilter === 'expired' && itemStatus.type !== 'expired') return false;

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO (COLUNA 5 - RESPONSIVO) */}
      <div ref={formRef} className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl h-fit">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border ${
              editingId
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
            }`}>
              {editingId ? <Pencil className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingId ? 'Editar Conteúdo / Notícia' : 'Criar Nova Notícia ou Cena'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {editingId ? 'Altere as informações abaixo e salve' : 'Configure o conteúdo e o agendamento antecipado'}
              </p>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Seletor de Tipo de Cena / Notícia */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tipo da Cena / Notícia
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Notícia Texto */}
              <button
                type="button"
                onClick={() => handleTypeChange('text')}
                className={`flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formData.type === 'text'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Notícia Texto</span>
              </button>

              {/* Notícia Imagem */}
              <button
                type="button"
                onClick={() => handleTypeChange('image')}
                className={`flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formData.type === 'image'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Com Foto</span>
              </button>

              {/* Cena de Clima & Temperatura */}
              <button
                type="button"
                onClick={() => handleTypeChange('weather')}
                className={`flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formData.type === 'weather'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CloudSun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Cena de Clima</span>
              </button>

              {/* Notícias em Geral / Feed */}
              <button
                type="button"
                onClick={() => handleTypeChange('feed')}
                className={`flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formData.type === 'feed'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Notícias Geral</span>
              </button>
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS PARA CENA DE CLIMA & TEMPERATURA */}
          {formData.type === 'weather' && (
            <div className="bg-sky-950/30 border border-sky-800/40 p-3 sm:p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-semibold text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cidade / Localidade *</span>
                </label>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Previsão ao Vivo
                </span>
              </div>

              {/* Chips de cidades rápidas */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, title: city }))}
                    className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                      formData.title === city
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-sky-500/50'
                    }`}
                  >
                    {city.split(',')[0]}
                  </button>
                ))}
              </div>

              {/* Input para digitar qualquer outra cidade */}
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ou digite outra cidade (ex: Curitiba, PR)..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-sky-800/60 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400"
                required
              />
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS PARA CENA DE NOTÍCIAS EM GERAL / FEED */}
          {formData.type === 'feed' && (
            <div className="bg-rose-950/30 border border-rose-800/40 p-3 sm:p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-semibold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Categoria do Feed *</span>
                </label>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Notícias ao Vivo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'g1', label: 'G1 Brasil (Ao Vivo)' },
                  { key: 'geral', label: 'Geral & Cidades' },
                  { key: 'tecnologia', label: 'Tecnologia & IA' },
                  { key: 'economia', label: 'Economia & Negócios' },
                  { key: 'esportes', label: 'Esportes & Futebol' }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, feedCategory: cat.key, category: cat.label }))}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      formData.feedCategory === cat.key
                        ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Título da Faixa
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Principais Destaques do Dia"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-rose-800/60 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                  required
                />
              </div>
            </div>
          )}

          {/* TÍTULO PRINCIPAL (Para notícias comuns) */}
          {(formData.type === 'text' || formData.type === 'image') && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Título Principal *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Reunião Geral de Alinhamento"
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                required
              />
            </div>
          )}

          {/* ADICIONAR IMAGEM DIRETO DA GALERIA DO CELULAR */}
          {formData.type === 'image' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Foto da Notícia *
                </label>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remover foto</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {formData.imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video group shadow-lg">
                  <img
                    src={formData.imageUrl}
                    alt="Preview da notícia"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xl cursor-pointer transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Trocar foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-2.5 sm:gap-3"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isProcessingImage ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {isProcessingImage ? 'Otimizando imagem...' : 'Toque para abrir a galeria do celular'}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      Selecione uma foto da sua galeria ou tire uma foto
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tema do Fundo / Gradiente (para tipos que usam cor) */}
          {formData.type !== 'image' && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tema Visual do Fundo
              </label>
              <select
                name="gradient"
                value={formData.gradient}
                onChange={handleInputChange}
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {formData.type === 'weather' ? (
                  <>
                    <option value="from-sky-600 via-blue-700 to-indigo-950">Céu Azul & Diurno</option>
                    <option value="from-amber-600 via-orange-600 to-purple-900">Pôr do Sol Dourado</option>
                    <option value="from-slate-900 via-indigo-950 to-black">Noite Estrelada</option>
                    <option value="from-slate-800 via-cyan-900 to-slate-950">Tempestade Tecnológica</option>
                  </>
                ) : formData.type === 'feed' ? (
                  <>
                    <option value="from-rose-800 via-red-900 to-neutral-950">Telejornal Vermelho Noturno</option>
                    <option value="from-indigo-900 via-slate-900 to-black">Tech News Azul & Preto</option>
                    <option value="from-emerald-800 via-teal-900 to-slate-950">Mercado & Finanças Verde</option>
                  </>
                ) : (
                  <>
                    <option value="from-indigo-600 via-purple-600 to-pink-600">Padrão (Púrpura / Azul)</option>
                    <option value="from-amber-600 via-orange-600 to-red-600">Alerta (Laranja / Vermelho)</option>
                    <option value="from-emerald-600 via-teal-600 to-cyan-600">Sucesso (Verde / Teal)</option>
                    <option value="from-slate-800 via-slate-900 to-black">Escuro Elegante</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Conteúdo / Detalhes */}
          {(formData.type === 'text' || formData.type === 'image') && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Conteúdo / Detalhes
              </label>
              <textarea
                name="content"
                rows="3"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Escreva os detalhes da notícia..."
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>
          )}

          {/* Intervalo no Carrossel (Tempo de tela desta notícia/cena) */}
          <div className="bg-slate-950/40 p-3 sm:p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                <span>Intervalo no Carrossel *</span>
              </label>
              <span className="text-[11px] sm:text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {formData.slideDuration}s
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                name="slideDuration"
                min="2"
                max="180"
                value={formData.slideDuration}
                onChange={handleInputChange}
                placeholder="Ex: 5, 8, 10..."
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs text-slate-500 font-medium pointer-events-none">
                segundos
              </span>
            </div>

            {/* Chips de Atalho Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 mr-1">Atalhos:</span>
              {[4, 6, 8, 10, 15, 20].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, slideDuration: String(sec) }))}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    Number(formData.slideDuration) === sec
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* NOVO RECURSO: AGENDAMENTO ANTECIPADO POR DATA E HORÁRIO */}
          {/* ======================================================== */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-indigo-500/30 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Programação & Agendamento</h3>
                <p className="text-[10px] text-slate-400">Programe quando este conteúdo entra e sai do ar</p>
              </div>
            </div>

            {/* 1. Início da Exibição */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Início da Exibição (Quando entra no ar)
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, startType: 'now', publishAtDateTime: '' }))}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    formData.startType === 'now'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🟢 Imediatamente
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      startType: 'scheduled',
                      publishAtDateTime: prev.publishAtDateTime || getCurrentDateTimeString()
                    }))
                  }
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    formData.startType === 'scheduled'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  📅 Agendar Data/Hora
                </button>
              </div>

              {formData.startType === 'scheduled' && (
                <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 font-semibold block">
                    Selecione o dia e o horário de entrada no ar:
                  </span>
                  <input
                    type="datetime-local"
                    name="publishAtDateTime"
                    min={getCurrentDateTimeString()}
                    value={formData.publishAtDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                    required={formData.startType === 'scheduled'}
                  />
                  {formData.publishAtDateTime && (
                    <p className="text-[10px] text-amber-200/90 leading-tight">
                      ⏰ Entrará no carrossel em: <b>{formatDateTime(formData.publishAtDateTime)}</b> (
                      {getRelativeTimeDescription(new Date(formData.publishAtDateTime).getTime(), true)})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Término da Exibição / Validade */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Término da Exibição (Quando sai do ar)
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, endType: 'never', expiresAtDateTime: '' }))}
                  className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                    formData.endType === 'never'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Permanente
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, endType: 'duration' }))}
                  className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                    formData.endType === 'duration'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Duração
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      endType: 'datetime',
                      expiresAtDateTime: prev.expiresAtDateTime || getCurrentDateTimeString()
                    }))
                  }
                  className={`p-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                    formData.endType === 'datetime'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Data/Hora Fim
                </button>
              </div>

              {formData.endType === 'duration' && (
                <div className="space-y-1">
                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="360">6 horas</option>
                    <option value="720">12 horas</option>
                    <option value="1440">24 horas (1 dia)</option>
                    <option value="10080">7 dias (1 semana)</option>
                  </select>
                </div>
              )}

              {formData.endType === 'datetime' && (
                <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-300 font-semibold block">
                    Data e horário em que sairá do ar:
                  </span>
                  <input
                    type="datetime-local"
                    name="expiresAtDateTime"
                    min={formData.publishAtDateTime || getCurrentDateTimeString()}
                    value={formData.expiresAtDateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    required={formData.endType === 'datetime'}
                  />
                  {formData.expiresAtDateTime && (
                    <p className="text-[10px] text-slate-300 leading-tight">
                      ⏹️ Encerrará a exibição em: <b>{formatDateTime(formData.expiresAtDateTime)}</b>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Etiqueta de Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Geral, Aviso, Eventos..."
                className="w-full px-3.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Botão de Publicar / Agendar / Salvar Edição */}
          {editingId ? (
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 sm:py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {formData.startType === 'scheduled' ? (
                <>
                  <CalendarDays className="w-4 h-4" />
                  <span>Salvar e Agendar Conteúdo</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Publicar no Carrossel Agora</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>

      {/* LISTAGEM E GERENCIAMENTO DE NOTÍCIAS (COLUNA 7 - RESPONSIVO) */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Conteúdos Cadastrados ({newsList.length})</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Monitore conteúdos no ar, agendados e histórico</p>
          </div>

          {/* Pílulas de Status Rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {liveCount} No Ar
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {scheduledCount} Agendada(s)
            </span>
            {expiredCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {expiredCount} Expirada(s)
              </span>
            )}
          </div>
        </div>

        {/* Abas de Filtragem de Status */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `Todos (${newsList.length})` },
            { id: 'live', label: `🟢 No Ar (${liveCount})` },
            { id: 'scheduled', label: `🟡 Agendadas (${scheduledCount})` },
            { id: 'expired', label: `🔴 Expiradas (${expiredCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por título ou categoria..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Lista Scrollável de Itens */}
        <div className="space-y-3 sm:space-y-3.5 flex-1 overflow-y-auto max-h-[520px] sm:max-h-[580px] pr-1">
          {filteredNews.length === 0 ? (
            <div className="text-center py-10 sm:py-14 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs sm:text-sm font-medium">Nenhum conteúdo encontrado nesta visualização.</p>
              <p className="text-[11px] text-slate-600 mt-1">Crie um novo conteúdo ou altere o filtro acima.</p>
            </div>
          ) : (
            filteredNews.map((item) => {
              const status = getItemStatus(item);

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 bg-slate-950/60 ${
                    status.type === 'scheduled'
                      ? 'border-amber-500/40 hover:border-amber-400/60'
                      : status.type === 'expired'
                      ? 'border-rose-900/40 opacity-70 hover:opacity-100'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Thumbnail / Ícone por Tipo */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center">
                      {item.type === 'image' ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : item.type === 'weather' ? (
                        <div className="w-full h-full bg-gradient-to-br from-sky-600 to-indigo-900 flex items-center justify-center">
                          <CloudSun className="w-6 h-6 text-amber-300" />
                        </div>
                      ) : item.type === 'feed' ? (
                        <div className="w-full h-full bg-gradient-to-br from-rose-700 to-red-950 flex items-center justify-center">
                          <Radio className="w-6 h-6 text-rose-300 animate-pulse" />
                        </div>
                      ) : (
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      )}
                    </div>

                    {/* Informações da Notícia */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {/* Badge de Status Principal (No Ar / Agendada / Expirada) */}
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.colorClass}`}
                        >
                          {status.type === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {status.type === 'scheduled' && <Calendar className="w-2.5 h-2.5 text-amber-300" />}
                          {status.label}
                        </span>

                        {/* Categoria */}
                        <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type === 'weather' ? 'Clima' : item.type === 'feed' ? 'Notícias ao Vivo' : item.category}
                        </span>

                        {/* Tempo de giro */}
                        <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                          <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                          {item.slideDuration || 5}s
                        </span>
                      </div>

                      {/* Título */}
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{item.title}</h4>

                      {/* Detalhes do agendamento / expiração */}
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{status.detail}</span>
                      </p>
                    </div>
                  </div>

                  {/* Ações: Editar e Excluir */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className={`p-2 sm:p-2.5 rounded-xl transition-all border cursor-pointer ${
                        editingId === item.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/30'
                          : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/30'
                      }`}
                      title="Editar Conteúdo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteNews(item.id)}
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                      title="Remover Conteúdo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
