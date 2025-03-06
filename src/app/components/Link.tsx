import { Github, Linkedin, Instagram, Twitter, Send } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

interface LinkProps {
  linkData: {
    linkTitle: string;
    link: string;
  };
}

const iconMap: Record<string, ReactNode> = {
  GitHub: <Github size={20} />,
  LinkedIn: <Linkedin size={20} />,
  Telegram: <Send size={20} />,
  Instagram: <Instagram size={20} />,
  X: <Twitter size={20} />,
};

function Links({ linkData }: LinkProps) {
  return (
    <Link
      href={linkData.link}
      target="_blank"
      rel="noopener noreferrer"
      className="linkBackgroundColor w-full py-3 px-4 rounded-lg mb-4 text-white flex items-center transition-all hover:scale-[1.02]"
    >
      <div className="flex items-center justify-center w-full gap-2">
        <span className="font-medium">{linkData.linkTitle}</span>
        <span className="text-gray-400">
          {iconMap[linkData.linkTitle] || null}
        </span>
      </div>
    </Link>
  );
}

export default Links;
