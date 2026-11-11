import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Image as ImageIcon,
  FileText,
  Zap,
  Search,
  Timer,
  Upload,
  X
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

export default function NewsManager({ newsList, onAddNews, onDeleteNews }) {
  const [formData, setFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    imageUrl: '',
    category: 'Geral',
    slideDuration: '5', // Tempo em segundos que a notícia fica no giro do carrossel
    durationMinutes: '0', // 0 = permanente (validade da notícia)
    gradient: 'from-indigo-600 via-purple-600 to-pink-600'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.title.trim()) {
      return;
    }

    if (formData.type === 'image' && !formData.imageUrl.trim()) {
      alert('Por favor, selecione uma foto da galeria para esta notícia.');
      return;
    }

    const minutes = parseInt(formData.durationMinutes, 10);
    const expiresAt = minutes > 0 ? Date.now() + minutes * 60 * 1000 : null;
    const slideDuration = Math.max(2, parseInt(formData.slideDuration, 10) || 5);

    const newNews = {
      id: Date.now().toString(),
      type: formData.type,
      title: formData.title,
      content: formData.content,
      imageUrl: formData.imageUrl,
      category: formData.category || 'Geral',
      slideDuration, // Intervalo personalizado desta notícia
      expiresAt,
      createdAt: Date.now(),
      bgColor: formData.gradient
    };

    onAddNews(newNews);

    // Resetar formulário mantendo valor padrão confortável
    setFormData({
      type: 'text',
      title: '',
      content: '',
      imageUrl: '',
      category: 'Geral',
      slideDuration: '5',
      durationMinutes: '0',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600'
    });
  };

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expirado';

    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m restantes`;
    }
    return `${mins}m ${secs}s restantes`;
  };

  const filteredNews = newsList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
      {/* FORMULÁRIO DE CADASTRO (COLUNA 5 - RESPONSIVO) */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl h-fit">
        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
          <div className="p-2 sm:p-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Criar Nova Notícia</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Configure o conteúdo, foto e tempo de giro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Tipo de Notícia */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tipo da Notícia
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'text' }))}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  formData.type === 'text'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Apenas Texto</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'image' }))}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  formData.type === 'image'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Com Imagem</span>
              </button>
            </div>
          </div>

          {/* Título */}
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

              {/* Input nativo invisível que abre a galeria do celular */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {formData.imageUrl ? (
                /* Preview visual da imagem escolhida */
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
                /* Card para tocar e abrir a galeria no celular */
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

              {/* Opção secundária alternativa para colar URL se preferir */}
              <div className="pt-1">
                <details className="text-xs text-slate-500">
                  <summary className="hover:text-slate-300 transition-colors cursor-pointer select-none">
                    Ou colar link de imagem da internet (URL)
                  </summary>
                  <div className="mt-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Estilo de Gradiente (Se for Texto) */}
          {formData.type === 'text' && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tema do Fundo
              </label>
              <select
                name="gradient"
                value={formData.gradient}
                onChange={handleInputChange}
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="from-indigo-600 via-purple-600 to-pink-600">Padrão (Púrpura / Azul)</option>
                <option value="from-amber-600 via-orange-600 to-red-600">Alerta (Laranja / Vermelho)</option>
                <option value="from-emerald-600 via-teal-600 to-cyan-600">Sucesso (Verde / Teal)</option>
                <option value="from-slate-800 via-slate-900 to-black">Escuro Elegante</option>
              </select>
            </div>
          )}

          {/* Conteúdo / Detalhes */}
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

          {/* Intervalo no Carrossel (Tempo de tela) */}
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
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Tempo em que esta notícia ficará visível na tela antes de passar para a próxima.
            </p>

            <div className="relative">
              <input
                type="number"
                name="slideDuration"
                min="2"
                max="180"
                value={formData.slideDuration}
                onChange={handleInputChange}
                placeholder="Ex: 5, 10, 15..."
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs text-slate-500 font-medium pointer-events-none">
                segundos
              </span>
            </div>

            {/* Chips de Atalho Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] sm:text-[11px] text-slate-500 mr-1">Atalhos:</span>
              {[3, 5, 8, 10, 15, 20, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, slideDuration: String(sec) }))}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                    Number(formData.slideDuration) === sec
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Categoria e Tempo de Expiração da Notícia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Urgente, RH"
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Validade (Expiração)
              </label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="0">Permanente (Sem expiração)</option>
                <option value="1">1 Minuto (Teste rápido)</option>
                <option value="5">5 Minutos</option>
                <option value="15">15 Minutos</option>
                <option value="60">1 Hora</option>
                <option value="1440">24 Horas</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Publicar no Carrossel</span>
          </button>
        </form>
      </div>

      {/* LISTAGEM E GERENCIAMENTO DE NOTÍCIAS ATIVAS (COLUNA 7 - RESPONSIVO) */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Notícias Ativas ({newsList.length})</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Gerencie o tempo e remova notícias em tempo real</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              {newsList.filter((n) => n.expiresAt).length} Temporária(s)
            </span>
          </div>
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

        {/* Lista Scrollável */}
        <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto max-h-[500px] sm:max-h-[560px] pr-1">
          {filteredNews.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-slate-500">
              <p className="text-xs sm:text-sm">
                {searchTerm ? 'Nenhuma notícia encontrada no filtro.' : 'Nenhuma notícia cadastrada.'}
              </p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 sm:gap-4 bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Thumbnail / Ícone */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    )}
                  </div>

                  {/* Informações da Notícia com truncamento seguro */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>

                      {/* Badge do tempo de giro configurado */}
                      <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                        <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                        {item.slideDuration || 5}s
                      </span>

                      {item.expiresAt && (
                        <span className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {formatTimeRemaining(item.expiresAt)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">{item.content || 'Sem descrição'}</p>
                  </div>
                </div>

                {/* Botão de Remoção */}
                <button
                  onClick={() => onDeleteNews(item.id)}
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer shrink-0"
                  title="Remover Notícia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
