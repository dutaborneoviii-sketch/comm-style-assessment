import { AuthForm } from "@/components/auth-form";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex flex-col items-center justify-center gap-10 text-center px-4 sm:px-8">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600 drop-shadow-sm pb-2 leading-tight">
              Temukan Gaya Komunikasi Anda
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto px-2">
              Memahami cara Anda berkomunikasi adalah langkah pertama menuju kolaborasi yang lebih baik. 
              Masuk untuk memulai asesmen dan lihat profil personal Anda.
            </p>
          </div>
          <div className="w-full max-w-sm relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25" />
            <div className="relative">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
