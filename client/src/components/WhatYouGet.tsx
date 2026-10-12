import { CATEGORIES } from "@/lib/constants";
import CategoryIcon from "./CategoryIcon";

export default function WhatYouGet() {
  return (
    <section aria-labelledby="what-you-get" className="mt-16">
      <h2 id="what-you-get" className="eyebrow text-center">
        What you&apos;ll get back
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <li key={cat.key} className="card p-4 shadow-none">
            <CategoryIcon category={cat} size="sm" />
            <h3 className="mt-3 text-sm font-semibold">{cat.label}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {cat.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
