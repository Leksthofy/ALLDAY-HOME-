import React, { useState } from "react";
import { Image as ImageIcon, Plus, Trash2, Tv, X } from "lucide-react";
import { FamilyPhoto } from "../types";

interface PhotosViewProps {
  photos: FamilyPhoto[];
  onAddPhoto: (photo: Omit<FamilyPhoto, "id">) => void;
  onDeletePhoto: (id: string) => void;
  onStartSlideshow: () => void;
}

export const PhotosView: React.FC<PhotosViewProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onStartSlideshow,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  const sampleImages = [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=80",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAddPhoto({
      title: title.trim() || "Foto de Família",
      url: url.trim(),
      caption: caption.trim() || undefined,
      dateAdded: new Date().toISOString().split("T")[0],
    });

    setTitle("");
    setUrl("");
    setCaption("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Memórias & Galeria da Casa</span>
          </div>
          <h2 className="text-xl font-bold text-white">Porta-Retrato Digital da Família</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartSlideshow}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer transition-all"
          >
            <Tv className="w-4 h-4" />
            <span>Iniciar Porta-Retrato Ambient</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg group relative"
          >
            <div className="h-56 relative overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => onDeletePhoto(photo.id)}
                className="absolute top-3 right-3 p-2 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Excluir foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white text-base leading-tight mb-1">
                {photo.title}
              </h3>
              {photo.caption && (
                <p className="text-xs text-slate-400">{photo.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Adicionar Nova Foto de Família
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título da Memória *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Passeio de Domingo no Parque com a Zoe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              {/* Sample Quick Select */}
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  Ou escolha uma imagem de exemplo:
                </span>
                <div className="flex gap-2 mt-2">
                  {sampleImages.map((s, i) => (
                    <img
                      key={i}
                      src={s}
                      alt="Sample"
                      onClick={() => setUrl(s)}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-700 hover:border-rose-500 cursor-pointer transition-all"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Legenda / Frase Carinhosa
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Sorriso da Zoe balançando ☀️"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
