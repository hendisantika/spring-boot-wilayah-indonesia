import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-4xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Peta Wilayah Indonesia
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive maps of Indonesian administrative boundaries
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Visualisasi batas wilayah Provinsi, Kabupaten/Kota, Kecamatan, dan Kelurahan/Desa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/provinsi"
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Provinsi
              </h2>
              <span className="text-3xl">🗺️</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              38 Provinces of Indonesia
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View provincial boundaries and details
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
          </Link>

          <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 p-8 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kabupaten/Kota
              </h2>
              <span className="text-3xl">🏙️</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Regencies and Cities
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon...
            </p>
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              SOON
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 p-8 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kecamatan
              </h2>
              <span className="text-3xl">📍</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Districts
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon...
            </p>
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              SOON
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 p-8 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelurahan/Desa
              </h2>
              <span className="text-3xl">🏘️</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Villages and Urban Villages
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon...
            </p>
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              SOON
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data source:{" "}
            <a
              href="https://geoservices.big.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              BIG (Badan Informasi Geospasial)
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
