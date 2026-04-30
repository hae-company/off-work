import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 py-4 flex flex-col items-center gap-2">
      <Link
        href="https://blog.hae02y.me"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
      >
        <Image src="/logo-light.svg" alt="hae02y" width={28} height={19} />
        <span className="text-[10px] text-zinc-400 tracking-widest">hae02y</span>
      </Link>
      <p className="text-[10px] text-zinc-300">칼퇴는 모든 직장인의 꿈입니다</p>
    </footer>
  );
}
