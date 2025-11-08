import icon from "../assets/icon.png";

export default function Landing() {
  return (
    <main className="h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="flex flex-row items-center gap-6 md:gap-8">
        <img
          src={icon}
          alt="CardWise icon"
          className="h-32 md:h-40 w-auto"  
        />
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-none">
          CardWise
        </h1>
      </div>
    </main>
  );
}
