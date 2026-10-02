'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { GalleryItem } from '@/types/school';

const CATEGORIES = [
  'All',
  'Campus & Heritage',
  'STEM & Academics',
  'Sports & Culture',
  'Student Life & Dining',
] as const;

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState<string>('All');
  const [preview, setPreview] = useState<GalleryItem | null>(null);

  const visible = useMemo(
    () => (category === 'All' ? items : items.filter((item) => item.category === category)),
    [items, category]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCategory(option)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              category === option
                ? 'border-teresa-green-900 bg-teresa-green-900 text-white shadow-soft scale-[1.03]'
                : 'border-slate-300 bg-white text-slate-700 hover:border-teresa-green-700 hover:text-teresa-green-800'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, index) => (
          <figure
            key={item.id}
            className="group animate-pop-in overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft card-lift"
            style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
          >
            <button type="button" onClick={() => setPreview(item)} className="block w-full text-left">
              <div className="overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-56 w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
              </div>
            </button>
            <figcaption className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teresa-gold-700">
                {item.category} &middot; {item.dateLabel}
              </p>
              <h3 className="mt-1 font-serif text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/85 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-3xl animate-pop-in overflow-hidden rounded-3xl bg-white shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <img src={preview.imageUrl} alt={preview.title} className="max-h-[70vh] w-full object-cover" />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute right-3 top-3 rounded-full bg-slate-900/70 p-2 text-white hover:bg-slate-900"
                aria-label="Close photograph"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teresa-gold-700">
                {preview.category} &middot; {preview.dateLabel}
              </p>
              <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">{preview.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{preview.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
