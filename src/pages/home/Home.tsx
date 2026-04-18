import Textbox from "../../components/Textbox";


function Home() {
  return (
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex h-full w-full">
        {/* lef t */}
        <div className="flex-1">left</div>

        {/* right */}
        <div className="flex-1">right</div>
      </div>
    </div>
  );
}

export default Home;
