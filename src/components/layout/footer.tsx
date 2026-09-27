import Link from "next/link";
import { Dumbbell } from "lucide-react";

/** Footer — 4-column grid mirrored from the reference (brand, links, support, hours). */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500">
                <Dumbbell className="h-5 w-5 text-white" aria-hidden />
              </div>
              <span className="text-lg font-bold">FitnessPro</span>
            </div>
            <p className="text-sm text-gray-400">
              Premium fitness experience with top-tier equipment and expert guidance.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/Memberships"
                className="block text-sm text-gray-400 transition-colors hover:text-white"
              >
                Memberships
              </Link>
              <Link
                href="/Shop"
                className="block text-sm text-gray-400 transition-colors hover:text-white"
              >
                Shop
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Email: support@fitnesspro.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Hours</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Mon-Fri: 5:00 AM - 11:00 PM</p>
              <p>Sat-Sun: 6:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 FitnessPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
