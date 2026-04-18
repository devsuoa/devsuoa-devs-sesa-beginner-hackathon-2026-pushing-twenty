import Textbox from "../../components/Textbox";


function Home() {
  return (
    // bg image
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex h-full w-full">
        {/* left */}
        <div className="flex-1 flex flex-col">

          {/* logo */}
          <div><img src="logo.png" alt="Logo" /></div>

          {/* python and alien code */}
          <div className="flex">
            <div className="flex-1">
              <Textbox
                lightcol="#005DA9"
                darkcol="#002E53"
                text="Python Code"
                headerimage="pythoncode.png"
              />
            </div>
            <div className="flex-1">
              <Textbox
                lightcol="#00A93D"
                darkcol="#00531F"
                text="Alien Code"
                headerimage="aliencode.png"
              />
            </div>
          </div>

          {/* task */}
          <div>
            <Textbox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                text="Task"
                headerimage="task.png"
              />
          </div>
        </div>

        {/* right */}
        <div className="flex-1">
          <div>Code</div>
          <div>
            <Textbox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                text="Output"
                headerimage="output.png"
              />
          </div>
        </div>


      </div>
    </div>
  );
}

export default Home;
