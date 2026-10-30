'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Check, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import { resolveImage } from '@/lib/images';
import { getProductCategoryLabel } from '@/lib/api/types';

export type ProductCardData = {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  discount?: string;
  weight?: string;
  category?: string;
  freeDelivery?: boolean;
};

type Props<T extends ProductCardData> = {
  product: T;
  onAdd: (product: T) => void;
  priority?: boolean;
};

export default function ProductCard<T extends ProductCardData>({ product, onAdd, priority }: Props<T>) {
  const [added, setAdded] = useState(false);
  const href = `/product/${product.slug}`;
  const hasDiscount = product.originalPrice > product.price && product.price > 0;
  const pct = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex flex-col bg-[#FBF7EE] rounded-[22px] overflow-hidden ring-1 ring-ink/[0.07] shadow-[0_1px_0_rgba(36,31,22,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(36,31,22,0.45)] hover:ring-ink/15">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-[#EFE6D3]">
        <Image
          src={resolveImage(product.image)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount || pct > 0 ? (
            <span className="inline-flex items-center bg-basil text-parchment font-label text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full shadow-sm">
              {product.discount || `${pct}% off`}
            </span>
          ) : null}
          {product.freeDelivery ? (
            <span className="inline-flex items-center gap-1 bg-parchment/90 backdrop-blur text-basil font-label text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full ring-1 ring-basil/15">
              <Truck size={11} strokeWidth={2.25} />
              Free delivery
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg ring-1 ring-ink/10 transition-all duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 ${
            added ? 'bg-basil text-parchment' : 'bg-parchment text-ink hover:bg-turmeric hover:text-parchment'
          }`}
        >
          {added ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
        </button>
      </Link>

      <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-label text-[10px] tracking-[0.18em] uppercase text-turmeric/90 truncate">
            {product.category ? getProductCategoryLabel(product.category) : 'Vrateez'}
          </span>
          {product.weight ? <span className="text-[11px] text-ink/40 shrink-0">{product.weight}</span> : null}
        </div>

        <Link href={href}>
          <h3 className="font-display text-[1.05rem] leading-snug text-ink line-clamp-2 min-h-[2.6rem] transition-colors group-hover:text-clay">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(product.rating) ? 'fill-millet text-millet' : 'text-ink/15'}
              />
            ))}
          </div>
          <span className="text-[11px] text-ink/45">
            {product.rating ? product.rating.toFixed(1) : '—'} · {product.reviews}
          </span>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[1.45rem] leading-none text-ink">₹{product.price}</span>
            {hasDiscount ? <span className="text-xs text-ink/35 line-through">₹{product.originalPrice}</span> : null}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              added ? 'bg-basil text-parchment' : 'bg-ink text-parchment hover:bg-turmeric'
            }`}
          >
            {added ? <Check size={14} strokeWidth={2.5} /> : <ShoppingBag size={14} />}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
