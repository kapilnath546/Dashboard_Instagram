import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32 text-center space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <span className="font-mono text-sm font-bold text-accent">404</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-charcoal-deep">
          Page not found
        </h1>
        <p className="text-body text-sm sm:text-base leading-relaxed">
          The product or page you are looking for may have been moved, unpublished, or the link has expired.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-white hover:bg-neutral-50 text-charcoal-deep font-medium text-sm transition-colors"
        >
          Browse All Finds
        </Link>
      </div>
    </div>
  );
}
