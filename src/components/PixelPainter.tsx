import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect
} from "react";
import "./../styles/PixelPainter.scss";
import * as R from "ramda";
// import * as htmlToImage from "html-to-image";

import html2canvas from "html2canvas";
import wantItAllorigin from "./../../jsonFile_wantItAll.json";
import starryNight from "./../../jsonFile_16576367.json";
import starryNight2 from "./../../jsonFile_16576228.json";
import wantItAll from "./../../jsonFile_16576374.json";

import DragPanel from "./DragPanel";
import HistoryPanel from "./HistoryPanel";
import ModalTool from "./ModalTool";
import SettingPanel from "./SettingPanel";

type DragPoint = {
  x: number;
  y: number;
};
interface ColorPickTarget extends EventTarget {
  value: string;
}
export interface paintDataFromLocal {
  id: string;
  listData: coordinateData[];
  thumbnail: string;
  canvaColor: string;
}

interface coordinateData {
  coor: string;
  color: string;
}

interface WholeData {
  ele: HTMLDivElement;
  id: string;
  color: string;
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<coordinateData[]>([]);
  // console.log('list', list)

  const [showText, setShowText] = useState<boolean>(false);
  const [prevDataFromLocal, setPrevDataFromLocal] = useState<
    paintDataFromLocal[]
  >([]);
  const [detectList, setDetectList] = useState<DragPoint[]>([]);
  // console.log('detectList', detectList)
  const [currentColor, setCurrentColor] = useState<string>("#ccff00");
  const [currentPicked, setCurrentPicked] = useState<paintDataFromLocal>();
  const [speed, setSpeed] = useState<number>(5);
  const [canvaColor, setCanvaColor] = useState<string>("#0c1117"); //#0c1a2a
  const [enable, setEnable] = useState<Boolean>(true);
  const [penWidth, setPenWidth] = useState<number>(3);
  const [showPenWidthMenu, setShowPenWidthMenu] = useState<Boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<Boolean>(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  const [settingPanelShow, setSettingPanelShow] = useState(false);
  const [demoIndex, setDemoIndex] = useState<number>(0);
  // console.log('eraseMode', eraseMode)

  // console.log('navigator.userAgent', navigator.userAgent)
  const isMobile = navigator.userAgent.indexOf(" Mobile ") !== -1;

  const reportWindowSize = (event: any) => {
    let rootContainer: HTMLDivElement | null = document.querySelector(
      ".pixel_canva_container"
    );
    if (!rootContainer) return;
    if (event.type === "load") {
      rootContainer.style.setProperty(
        "--main-width",
        window.innerWidth.toString()
      );
    } else {
      rootContainer.style.setProperty(
        "--main-width",
        window.innerWidth.toString()
      );
    }
    // let appEle:any = document.querySelector('.App');
    // if(!appEle) return;
    // if(isMobile) {
    //   appEle.style.height = 'unset';
    // } else {
    //   appEle.style.height = 'unset';
    // }
  };

  useEffect(() => {
    window.addEventListener("load", reportWindowSize);
    window.addEventListener("resize", reportWindowSize);
  }, []);

  useEffect(() => {
    getDataAgain();
  }, []);

  const getDataAgain = () => {
    let prevData = window.localStorage.getItem("pixelData");
    // console.log('prevData', prevData)
    let prevList = prevData ? JSON.parse(prevData) : [];
    // console.log("prevList", prevList);
    setPrevDataFromLocal(prevList);
  };

  const deleteThisPaint = (id: string) => {
    let tempList = [...prevDataFromLocal];
    let modified = tempList.filter((item) => {
      return item.id !== id;
    });
    setPrevDataFromLocal(modified);
    window.localStorage.setItem("pixelData", JSON.stringify(modified));
  };

  const allList = new Array(50).fill(0).map((item, key) => {
    return new Array(50).fill(0).map((key) => {
      return key + 1;
    });
  });

  let tempList = [...list];

  const resetList = () => {
    setList([]);
    setCanvaColor('transparent');
  };

  const resizeStroke = (cubeId: string, scale: number) => {
    let itemX = Number(cubeId.split("-")[0]);
    let itemY = Number(cubeId.split("-")[1]);

    let scaledPenWidth = scale;

    const newList = new Array(scaledPenWidth).fill(0).map((item, key) => {
      return new Array(scaledPenWidth).fill(0).map((innerItem, innerKey) => {
        return { accordingX: innerKey, accordingY: key };
      });
    });

    let scaledCubeList = R.flatten(newList).map((item, index) => {
      let prepareCubeId = `${itemX + item.accordingX}-${
        itemY + item.accordingY
      }`;
      let prepareEle = document.getElementById(prepareCubeId);
      if (!prepareEle) return;
      return { ele: prepareEle, id: prepareCubeId, color: currentColor };
    });
    return scaledCubeList;
  };

  const handleReturnCubeId = (coorItem: DragPoint) => {
    // console.log("coorItem", coorItem);
    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    if (
      coorItem.x <= 0 ||
      coorItem.y <= 0 ||
      coorItem.x > parentRect.width ||
      coorItem.y > parentRect.height
    )
      return;
    let cubeList = [...document.querySelectorAll(".cube")];
    // console.log("parentRect", parentRect);
    try {
      let targetEle = cubeList.filter((cubeItem, cubeIndex) => {
        let cubeRect: DOMRect = cubeItem.getBoundingClientRect();
        // console.log('cubeRect', cubeRect)
        let cubeLeft = cubeRect.left - parentRect.left;
        let cubeRight = cubeRect.right - parentRect.left;
        let cubeTop = cubeRect.top - parentRect.top;
        let cubeBottom = cubeRect.bottom - parentRect.top;
        return (
          coorItem.x <= cubeRight &&
          cubeLeft <= coorItem.x &&
          coorItem.y <= cubeBottom &&
          cubeTop <= coorItem.y
        );
      })[0];
      if (!targetEle.id) return;

      // return { ele: targetEle, id: targetEle.id, color: currentColor };
      return resizeStroke(targetEle.id, penWidth);
    } catch (err) {
      console.log("err", err);
    }
  };

  const eraseCube = (e: React.TouchEvent) => {
    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    let coor = { x: Math.floor(clientXX), y: Math.floor(clientYY) };
    // console.log('coor', coor)

    let currentChanged = handleReturnCubeId(coor);
    if (!currentChanged) return;
    let lightCurrentChanged = currentChanged.map((item: any, index) => {
      return { coor: item.id };
    });
    // console.log('lightCurrentChanged', lightCurrentChanged)
    if (!lightCurrentChanged) return;
    let withoutColor = list.map((i) => {
      return { coor: i.coor };
    });
    // console.log('withoutColor', withoutColor)
    let compareResult = lightCurrentChanged.filter((x) =>
      R.includes(x, withoutColor)
    );
    // console.log('compareResult', compareResult)
    compareResult.forEach((item) => {
      let ele = document.getElementById(item.coor);
      if (!ele) return;
      let targetIndex = tempList
        .map((i) => {
          return i.coor;
        })
        .indexOf(item.coor);
      if (targetIndex >= 0) {
        tempList.splice(targetIndex, 1);
      }

      setList(tempList);
    });
  };

  useEffect(() => {
    if (detectList.length) {
      // console.log("detectList", detectList);
      let lastChanged = handleReturnCubeId(detectList[detectList.length - 1]);
      // console.log("lastChanged", lastChanged);
      if (lastChanged) {

        lastChanged.forEach((item: any, key) => {
          if (!item) return;
          tempList.push({ coor: item.id, color: item.color });
        });
        setList(R.uniq(tempList));
        // setList(tempList);
        setDetectList([]);
      }
    }
  }, [detectList]);

  let temp = [...detectList];
  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    // let coor = { x: 8*Math.floor(clientXX/8), y: 8*Math.floor(clientYY/8) };
    let coor = { x: Math.floor(clientXX), y: Math.floor(clientYY) };
    console.log("coor", coor);

    if (R.includes(coor, temp)) {
    } else {
      temp.push(coor);
    }
    setDetectList(temp);
  };

  useEffect(() => {
    paintCube();
  }, [list]);

  const renderCube = () => {
    return allList.map((dayItem, key) => {
      return (
        <div key={key} className="hour">
          {dayItem.map((cubeItem, cubeKey) => {
            return (
              <div
                className={`cube`}
                id={`${key + 1}-${cubeKey + 1}`}
                key={cubeKey}
              ></div>
            );
          })}
        </div>
      );
    });
  };

  const paintCube = () => {
    if (list.length) {
      if (eraseMode) {
        let cubeList = [...document.querySelectorAll(".cube")];
        let withoutColor = list.map((i) => {
          return i.coor;
        });
        let modifiedCubeList = cubeList.filter((i) => {
          return !R.includes(i.id, withoutColor);
        });
        modifiedCubeList.forEach((item) => {
          let cubeEle = document.getElementById(item.id);
          if (!cubeEle) return;
          cubeEle.style.backgroundColor = "transparent";
        });
      }
      list.forEach((item) => {
        let cubeEle = document.getElementById(item.coor);
        if (!cubeEle) return;
        cubeEle.style.backgroundColor = item.color;
      });
    } else {
      let cubeList = [...document.querySelectorAll(".cube")];
      cubeList.forEach((item) => {
        let cubeEle = document.getElementById(item.id);
        if (!cubeEle) return;
        cubeEle.style.backgroundColor = "transparent";
      });
    }
  };

  const save = async () => {
    let thumbnail = await saveThumbnail();
    let prepare = [
      ...prevDataFromLocal,
      {
        listData: list,
        id: new Date().getTime().toString(),
        thumbnail: thumbnail,
        canvaColor: canvaColor
      }
    ];
    console.log("prepare", prepare);
    window.localStorage.setItem("pixelData", JSON.stringify(prepare));

    setTimeout(() => {
      getDataAgain();
      temp = [];
      tempList = [];
      setDetectList([]);
      setList([]);
    }, 200);
    setTimeout(() => {
      if (listPanelRef.current) {
        listPanelRef.current.scrollTo({
          top: Number.MAX_SAFE_INTEGER,
          behavior: "smooth"
        });
      }
    }, 250);
  };

  const importList = () => {
    setList([]);
  };

  const readFile = (e: any) => {
    let files = e.target.files;
    // console.log(files);
    let reader = new FileReader();
    reader.onload = (r: any) => {
      //  console.log(r.target.result);
      try {
        let toParse = JSON.parse(r.target.result);
        // console.log("toParse", toParse);
        // console.log("toParse.listData", toParse.listData);
        setList(toParse.listData);
        setCanvaColor(toParse.canvaColor);
      } catch (parseErr) {
        console.log("parseErr", parseErr);
      }
    };
    reader.readAsText(files[0]);
  };

  // console.log('enable', enable)

  useEffect(() => {
    if (showText) {
      tempList = [];
      if (!currentPicked) return;
      setCanvaColor(currentPicked.canvaColor);
      setEnable(false);
      currentPicked.listData.forEach((item, key) => {
        setTimeout(() => {
          tempList.push({ coor: item.coor, color: item.color });
          setList([...tempList]);
        }, speed * key);
        setCurrentPicked(undefined);
        setShowText(false);
      });
      let count = currentPicked.listData.length;
      // console.log('count', count)
      setTimeout(() => {
        setEnable(true);
      }, count * speed);
      // console.log('count * speed', count * speed)
    }
  }, [showText]);

  const play = (item: paintDataFromLocal) => {
    setList([]);
    setHistoryModalShow(false);
    setTimeout(() => {
      setCurrentPicked(item);
      setShowText(true);
    }, 500);

  };

  const exportData = (item: paintDataFromLocal) => {
    const content = JSON.stringify({
      listData: item.listData,
      canvaColor: item.canvaColor ?item.canvaColor: canvaColor
    });
    let a = document.createElement("a");
    let file = new Blob([content], { type: "text/json" });
    a.href = URL.createObjectURL(file);
    a.download = `jsonFile_${Math.floor(Number(item.id) / 100000)}.json`;
    a.click();
  };

  const changeColor = (eventTarget: ColorPickTarget) => {
    setCurrentColor(eventTarget.value);
  };
  const changeCanvaColor = (eventTarget: ColorPickTarget) => {
    setCanvaColor(eventTarget.value);
  };

  const saveThumbnail = () => {
    return new Promise<string>((resolve, reject) => {
      if (!wrapRef.current) return;

      html2canvas(wrapRef.current)
        .then((canvas) => {
          let dataUrl = canvas.toDataURL("image/jpeg");
          // .replace("image/jpeg", "image/octet-stream");

          resolve(dataUrl);
        })
        .catch((err) => {
          console.log("err", err);
          reject(err);
        });
    });
  };

  const demoPlay = () => {
    let prevSpeed = speed;

    let demoList = [wantItAll, starryNight]
    let tempObj = { ...demoList[demoIndex], id: "", thumbnail: "" };
    setList([]);
    setCurrentPicked(tempObj);
    setShowText(true);
    setSpeed(5);

    let count = starryNight.listData.length;
    // console.log('count', count)
    let tempIndex = 0;
    if(demoIndex === 1) {
      tempIndex = 0;
    } else {
      tempIndex=1;
    }
    setDemoIndex(tempIndex);
    setTimeout(() => {
      // console.log('prevSpeed', prevSpeed)
      setSpeed(prevSpeed);

    }, count*speed);
  };

  const changePenWidth = (item: number) => {
    setPenWidth(item);
    setShowPenWidthMenu(false);
  };

  const changeSpeedLevel = (item: number) => {
    setSpeed(item);
    setShowSpeedMenu(false);
  };


  return (
    <div className="pixel_canva_container">
      <div className="paint_body">
        <div className="header">Pixel Painter</div>
        <div className="btn_area">
          
          <div className="btn_row">
            <div className="tip_text">功能操作</div>
            <div
              className={`btn demo_btn ${enable ? "" : "disable"}`}
              onClick={demoPlay}
            >
              Demo
            </div>
            <div
              className={`btn import_btn ${enable ? "" : "disable"}`}
              onClick={importList}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="inputFile"
                name="inputFile"
                className="file_input"
                onChange={(e) => readFile(e)}
              />
              Import
            </div>
            <div
              className={`btn reset_btn ${enable ? "" : "disable"}`}
              onClick={resetList}
            >
              Reset
            </div>
            <div
              className={`btn save_btn ${enable ? "" : "disable"}`}
              onClick={save}
            >
              Save
            </div>
            <div
              className={`btn history_btn ${enable ? "" : "disable"}`}
              onClick={()=>setHistoryModalShow(true)}
            >
              History
            </div>
            <div
              className={`btn setting_btn ${enable ? "" : "disable"} ${settingPanelShow ? 'active':''}`}
              onClick={()=>setSettingPanelShow(!settingPanelShow)}
            >
              Setting
            </div>
          </div>
        </div>
        <div className="wrap_outer">
          <div
            className="wrap"
            // draggable={true}
            ref={wrapRef}
            onTouchMove={(e) => (eraseMode ? eraseCube(e) : handleTouchMove(e))}
            style={{ backgroundColor: canvaColor }}
          >
            {renderCube()}
          </div>
        </div>

      </div>
      {prevDataFromLocal.length && historyModalShow ? (
        <ModalTool
            modalShow={historyModalShow}
            modalCloseFunction={()=>setHistoryModalShow(false)}
            modalWidth={"unset"}
            modalHeight={"400px"}
            modalInnerBackground={"#ffffff20"}
            backgroundOpacity={0.5}
            background={"#000000"}
            zIndex={12}
        >
          <HistoryPanel
            prevDataFromLocal={prevDataFromLocal}
            listPanelRef={listPanelRef}
            enable={enable}
            play={play}
            exportData={exportData}
            deleteThisPaint={deleteThisPaint}
            historyModalShow={historyModalShow}
            setHistoryModalShow={setHistoryModalShow}
          ></HistoryPanel>
        </ModalTool>
      ) : null}

      <DragPanel
          id={"functionPanel"}
          background={"transparent"}
          childStartX={0.08}
          childStartY={0.2}
          show={settingPanelShow}
          setShow={setSettingPanelShow}
        >
          <SettingPanel
            canvaColor={canvaColor}
            changeCanvaColor={changeCanvaColor}
            currentColor={currentColor}
            changeColor={changeColor}
            showSpeedMenu={showSpeedMenu}
            setShowSpeedMenu={setShowSpeedMenu}
            speed={speed}
            changeSpeedLevel={changeSpeedLevel}
            showPenWidthMenu={showPenWidthMenu}
            setShowPenWidthMenu={setShowPenWidthMenu}
            penWidth={penWidth}
            changePenWidth={changePenWidth}
            eraseMode={eraseMode}
            setEraseMode={setEraseMode}
          />
        </DragPanel>  
    </div>
  );
};
