'use client';

import { useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCategories, useProducts } from '@/context/CatalogContext';
import type { Product } from '@/lib/api/types';
import ProductCard from '@/component/product/ProductCard';

type ProductView = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  freeDelivery?: boolean;
};

function mapProduct(p: Product): ProductView {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    price: p.price,
    originalPrice: p.originalPrice,
    discount: p.discount,
    weight: p.weight,
    freeDelivery: p.freeDelivery,
  };
}

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { products: rawProducts, loaded: productsLoaded } = useProducts();
  const { categories } = useCategories();
  const products = useMemo(() => rawProducts.map(mapProduct), [rawProducts]);
  const loading = !productsLoaded;
  const { addToCart } = useCart();

  const filters = [
    { key: 'all', label: 'All' },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ];

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAddToCart = (product: ProductView) => {
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: product.weight,
      freeDelivery: product.freeDelivery,
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-parchment" id="products">
        <div className="max-w-7xl mx-auto px-8 text-center text-ink/50 text-sm">Loading products…</div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-16 bg-parchment" id="products">
      <div className="max-w-7xl mx-auto px-8">
        <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay text-center mb-3">The range</p>
        <h2 className="font-display italic text-4xl md:text-5xl text-center text-ink mb-4" data-reveal>Our Products</h2>
        <p className="text-center text-ink/55 mb-10 max-w-2xl mx-auto text-[15px] leading-relaxed">
          High-protein cookies, energy bars &amp; superfood snacks — all crafted with real ingredients and zero added
          sugar.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                activeCategory === cat.key
                  ? 'bg-ink text-parchment shadow-lg'
                  : 'bg-ink/5 text-ink/70 hover:bg-ink/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} onAdd={handleAddToCart} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
