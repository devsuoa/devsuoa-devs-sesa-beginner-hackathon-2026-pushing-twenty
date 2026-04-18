import Textbox from "../../components/Textbox";


function Home() {
  return (
    // bg image
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex h-full w-full">
        {/* left */}
        <div className="flex-1 flex flex-col">

          {/* logo */}
          <div>Logo</div>

          {/* python and alien code */}
          <div className="flex">
            <div className="flex-1">
              Python Code
            </div>
            <div className="flex-1">
              Alien Code
            </div>
          </div>

          {/* task */}
          <div>task</div>
        </div>

        {/* right */}
        <div className="flex-1">
          <div>Code</div>
          <div>Output</div>
        </div>


      </div>
    </div>
  );
}

export default Home;
