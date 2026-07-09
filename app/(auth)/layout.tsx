import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-6 text-lg font-bold tracking-tight text-white"
      >
        PLAT<span className="text-gradient">FORM</span>
      </Link>
      <div className="glass-strong animate-fade-up w-full max-w-sm p-6">
        {children}
      </div>
    </div>
  );
}