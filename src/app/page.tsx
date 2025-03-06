import Card from './components/Card';
import WeatherEffects from './components/WeatherEffect';

export default function Home() {
  return (
    <div className="bg-[#141414] flex justify-center items-center h-[100vh] w-[100vw] overflow-hidden">
      <WeatherEffects />
      <div className="relative z-30">
        <Card />
      </div>
    </div>
  );
}
