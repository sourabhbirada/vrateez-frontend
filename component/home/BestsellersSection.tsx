'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProductsApi } from '@/lib/api/productApi';
import type { Product } from '@/lib/api/types';
import ProductCard, { type ProductCardData } from '@/component/product/ProductCard';

const HIDDEN_CATEGORIES = new Set(['testing', 'test']);

function toCard(p: Product): ProductCardData {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    price: p.price,
    originalPrice: p.originalPrice,
    discount: p.discount,
    weight: p.weight,
    category: p.category,
    freeDelivery: p.freeDelivery,
  };
}

export default function BestsellersSection() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    getProductsApi({ limit: 100 })
      .then((res) => {
        if (!cancelled) setProducts(res.items);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { top, avgRating, totalReviews } = useMemo(() => {
    const eligible = products.filter((p) => p.isActive !== false && !HIDDEN_CATEGORIES.has(p.category) && p.reviews > 0);
    const sorted = [...eligible].sort((a, b) => b.reviews * b.rating - a.reviews * a.rating);
    const reviews = eligible.reduce((n, p) => n + p.reviews, 0);
    const weighted = reviews ? eligible.reduce((n, p) => n + p.rating * p.reviews, 0) / reviews : 0;
    return { top: sorted.slice(0, 4), avgRating: weighted, totalReviews: reviews };
  }, [products]);

  if (top.length < 2) return null;

  const handleAdd = (p: ProductCardData) => {
    addToCart({
      id: String(p.id),
      slug: p.slug,
      name: p.name,
      image: p.image,
      price: p.price,
      originalPrice: p.originalPrice,
      weight: p.weight || '',
      freeDelivery: p.freeDelivery,
    });
  };

  return (
    <section className="bg-parchment py-16 md:py-20" id="bestsellers">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8 md:mb-10" data-reveal>
          <div>
            <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-3">Start here</p>
            <h2 className="font-display italic text-4xl md:text-5xl text-ink leading-none">Bestsellers</h2>
            <p className="mt-3 text-[15px] text-ink/55 max-w-md">
              The bakes customers reorder most. Add one, or build a box above ₹499 and shipping is on us.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {totalReviews > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-ink/[0.08] px-4 py-2 text-sm">
                <span className="inline-flex items-center gap-0.5 text-millet">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < Math.round(avgRating) ? 'fill-millet' : 'fill-transparent'} />
                  ))}
                </span>
                <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span>
                <span className="text-ink/45">from {totalReviews}+ reviews</span>
              </div>
            ) : null}
            <Link href="/shop" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-ink transition">
              View all <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {top.map((p, i) => (
            <div key={p._id} className="relative" data-reveal data-reveal-delay={String(i * 90)}>
              {i === 0 ? (
                <span className="absolute -top-2 left-3 z-10 rounded-full bg-turmeric text-parchment font-label text-[9px] tracking-[0.16em] uppercase px-2.5 py-1 shadow">
                  #1 seller
                </span>
              ) : null}
              <ProductCard product={toCard(p)} onAdd={handleAdd} priority={i < 2} />
            </div>
          ))}
        </div>

        <Link href="/shop" className="mt-6 inline-flex md:hidden items-center gap-1.5 text-sm font-semibold text-clay">
          View all products <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
