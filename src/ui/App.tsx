import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useStatistics } from "./useStatistics";
import { Chart } from "./Chart";

function App() {
  const staticData = useStaticData();
  const statistics = useStatistics(10);
  const [activeView, setActiveView] = useState<View>("CPU");
  const cpuUsages = useMemo(
    () => statistics.map((stat) => stat.cpuUsage),
    [statistics]
  );

  const ramUsages = useMemo(
    () => statistics.map((stat) => stat.ramUsage),
    [statistics]
  );

  const storageUsages = useMemo(
    () => statistics.map((stat) => stat.storageUsage),
    [statistics]
  );

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case "CPU":
        return cpuUsages;
      case "RAM":
        return ramUsages;
      case "STORAGE":
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  useEffect(() => {
    window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="main">
        <div>
          <SelectOption
            onClick={() => setActiveView("CPU")}
            title="CPU"
            view="CPU"
            subTitle={staticData?.cpuModel ?? ""}
            data={cpuUsages}
          />
          <SelectOption
            onClick={() => setActiveView("RAM")}
            title="RAM"
            view="RAM"
            subTitle={(staticData?.totalMemoryGB.toString() ?? "") + " GB"}
            data={ramUsages}
          />
          <SelectOption
            onClick={() => setActiveView("STORAGE")}
            title="STORAGE"
            view="STORAGE"
            subTitle={(staticData?.totalStorage.toString() ?? "") + " GB"}
            data={storageUsages}
          />
        </div>
        <div className="mainGrid">
          <Chart
            selectedView={activeView}
            data={activeUsages}
            maxDataPoints={10}
          />
        </div>
      </div>
    </div>
  );
}

function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string;
  data: number[];
  onClick: () => void;
}) {
  return (
    <button className="selectOption" onClick={props.onClick}>
      <div className="selectOptionTitle">
        <div>{props.title}</div>
        <div>{props.subTitle}</div>
      </div>
      <div className="selectOptionChart">
        <Chart selectedView={props.view} data={props.data} maxDataPoints={10} />
      </div>
    </button>
  );
}

function Header() {
  return (
    <header
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        backgroundColor: "#333",
        padding: "8px",
      }}
    >
      <button
        id="close"
        style={{
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "4px",
          width: "30px",
          height: "30px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={() => {
          window.electron.sendFrameAction("CLOSE");
          // console.log("clicked close");
        }}
      >
        X
      </button>
      <button
        id="minimize"
        style={{
          backgroundColor: "#f1c40f",
          color: "white",
          border: "none",
          borderRadius: "4px",
          width: "30px",
          height: "30px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      >
        _
      </button>
      <button
        id="maximize"
        style={{
          backgroundColor: "#2ecc71",
          color: "white",
          border: "none",
          borderRadius: "4px",
          width: "30px",
          height: "30px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      >
        ⬛
      </button>
    </header>
  );
}

function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData());
    })();
  }, []);

  return staticData;
}

export default App;
