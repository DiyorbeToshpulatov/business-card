import Image from 'next/image';
import Link from './Link';

function Card() {
  const links = [
    {
      linkTitle: 'GitHub',
      link: 'https://github.com/DiyorbeToshpulatov',
    },
    {
      linkTitle: 'LinkedIn',
      link: 'https://www.linkedin.com/in/diyorbek-toshpulatov-6146ab22b/',
    },
    {
      linkTitle: 'Telegram',
      link: 'https://t.me/d_fazliddinovich',
    },
    {
      linkTitle: 'Instagram',
      link: 'https://www.instagram.com/d_fazliddinovich/#',
    },
    {
      linkTitle: 'X',
      link: 'https://x.com/DiyorbekLatov',
    },
  ];

  return (
    <main className="cardBackground p-5 pb-1 rounded-xl flex flex-col justify-center items-center">
      <Image
        src="/images/dtech.jpeg"
        alt="Profile image"
        width={88}
        height={88}
        style={{
          borderRadius: '50%',
        }}
        className="mb-6"
      />

      <h1 className="text-4xl font-bold mb-2">Diyorbek T.</h1>
      <h2 className="text-xl neon font-semibold mb-6">Tashkent, Uzbekistan</h2>
      <p className="mb-6 text-[1.3125rem]">
        &ldquo;Front-end developer at E-BIRJA&ldquo;
      </p>

      {links.map(link => (
        <Link linkData={link} key={link.linkTitle} />
      ))}
    </main>
  );
}

export default Card;
