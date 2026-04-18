import Codebox from "../../components/Codebox";
import Textbox from "../../components/Textbox";
import {useState} from "react"

function Home() {
  // code output
  const [output, setOutput] = useState("Waiting for code...");

  return (
    // bg image
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex max-w-[1600px] mx-auto px-8 gap-10">
        {/* left */}
        <div className="flex-1 flex flex-col gap-6">

          {/* logo */}
          <div><img src="logo.png" alt="Logo" className="mx-auto w-140"/></div>

          {/* python and alien code */}
          <div className="flex gap-6">
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
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <Codebox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                headerimage="code.png" onOutput={setOutput}></Codebox>
          </div>
          <div>
            <Textbox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                text={output}
                headerimage="output.png"
              />
          </div>
        </div>


      </div>
    </div>
  );
}

export default Home;
