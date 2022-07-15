import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect,
  Fragment
} from "react";
import "./../styles/PixelPainter.scss";
import * as R from "ramda";
import html2canvas from "html2canvas";
import starryNight from "./../../jsonFile_16578030.json";
import wantItAll from "./../../jsonFile_16576374.json";
import DragPanel from "./DragPanel";
import GalleryPanel from "./GalleryPanel";
import ModalTool from "./ModalTool";
import SetupPanel from "./SetupPanel";

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

interface PalmRejectSize {
  w: number;
  h: number;
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<coordinateData[]>([]);
  // console.log("list", list);

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
  const [penWidth, setPenWidth] = useState<number>(2);
  const [showPenWidthMenu, setShowPenWidthMenu] = useState<Boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<Boolean>(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [galleryModalShow, setGalleryModalShow] = useState(false);
  const [setupPanelShow, setSetupPanelShow] = useState(true);
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [palmRejectShow, setPalmRejectShow] = useState<Boolean>(false);
  const [palmRejectSizeIndex, setPalmRejectSizeIndex] = useState<number>(0);
  const [isPainting, setIsPainting] = useState<Boolean>(false);
  const [touchBehavior, setTouchBehavior] = useState<string>("finger");
  const [touchTipShow, setTouchTipShow] = useState<Boolean>(false);
  // console.log('eraseMode', eraseMode)
  const palmRejectSizeList: PalmRejectSize[] = [
    { w: 200, h: 300 },
    { w: 250, h: 400 },
    { w: 350, h: 500 },
    { w: 450, h: 600 }
  ];

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
    setCanvaColor("transparent");
    eraseAllCube();
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
    // console.log("newList", newList);
    const makeupStroke = (
      newList: {
        accordingX: number;
        accordingY: number;
      }[][]
    ) => {
      switch (penWidth) {
        case 3:
          return [[newList[0][1]], newList[1], [newList[2][1]]];
          break;
        case 4:
          return [
            [newList[0][1], newList[0][2]],
            newList[1],
            newList[2],
            [newList[3][1], newList[3][2]]
          ];
          break;
        case 5:
          return [
            [newList[0][2]],
            [newList[1][1], newList[1][2], newList[1][3]],
            newList[2],
            [newList[3][1], newList[3][2], newList[3][3]],
            [newList[4][2]]
          ];
          break;
        case 6:
          return [
            [newList[0][2], newList[0][3]],
            [newList[1][1], newList[1][2], newList[1][3], newList[1][4]],
            newList[2],
            newList[3],
            [newList[4][1], newList[4][2], newList[4][3], newList[4][4]],
            [newList[5][2], newList[5][3]]
          ];
          break;

        default:
          return newList;
          break;
      }
    };
    let makeupResult = makeupStroke(newList);
    // console.log('makeupResult', makeupResult)
    let scaledCubeList = R.flatten(makeupResult).map((item, index) => {
      let prepareCubeId = `${itemX + item.accordingX}-${
        itemY + item.accordingY
      }`;
      let prepareEle = document.getElementById(prepareCubeId);
      if (!prepareEle) return;
      return { ele: prepareEle, id: prepareCubeId, color: currentColor };
    });
    return scaledCubeList;
  };

  const getCubeId = (coorItem: DragPoint) => {
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

  const canvaTouchEnable = (e: React.TouchEvent) => {
    let behavior: string = getTouchBehavior(e);
    // console.log("behavior", behavior);
    if (behavior !== touchBehavior) {
      return false;
    } else {
      return true;
    }
  };
  const touchStart = (e: React.TouchEvent) => {
    setIsPainting(true);
    if (!canvaTouchEnable(e)) return;
  };
  const eraseMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!canvaTouchEnable(e)) return;

    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    // let coor = { x: 8*Math.floor(clientXX/8), y: 8*Math.floor(clientYY/8) };
    let coor = { x: Math.floor(clientXX), y: Math.floor(clientYY) };
    // console.log("erase_coor", coor);

    let currentChanged = getCubeId(coor);
    // console.log("currentChanged", currentChanged);
    if (!currentChanged) return;
    let currentChangedWithoutColor = currentChanged.map((item: any, index) => {
      if (!item) return;
      return { coor: item.id };
    });
    // console.log("currentChangedWithoutColor", currentChangedWithoutColor);
    if (!currentChangedWithoutColor) return;
    let withoutColor = list.map((i) => {
      return { coor: i.coor };
    });
    // console.log("withoutColor", withoutColor);
    let compareResult = currentChangedWithoutColor.filter((x) =>
      R.includes(x, withoutColor)
    );

    // console.log("erase_compareResult", compareResult);

    compareResult.forEach((item) => {
      if (!item) return;
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
      eraseCubeSingle(item);
      setList(tempList);
    });
  };

  useEffect(() => {
    if (detectList.length) {
      // console.log("detectList", detectList);
      let lastChanged = getCubeId(detectList[detectList.length - 1]);
      // console.log("lastChanged", lastChanged);
      if (lastChanged) {
        // console.log("lastChanged", lastChanged);
        lastChanged.forEach((item: any, key) => {
          if (!item) return;
          if (eraseMode) {
            // eraseCubeSingle({ coor: item.id });
          } else {
            paintCubeSingle({ coor: item.id, color: item.color });
          }
        });
      }
    }
  }, [detectList]);

  let temp = [...detectList];
  const paintMove = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (!canvaTouchEnable(e)) {
      // alert(`若欲使用${touchBehavior === 'finger' ? '觸控筆':'指尖'}繪圖，請修改設定`);
      setTouchTipShow(true);
      
      return;
    }

    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    // let coor = { x: 8*Math.floor(clientXX/8), y: 8*Math.floor(clientYY/8) };
    let coor = { x: Math.floor(clientXX), y: Math.floor(clientYY) };
    // console.log("coor", coor);

    if (R.includes(coor, temp)) {
    } else {
      temp.push(coor);
    }
    // console.log("temp", temp);
    setDetectList(temp);
  };

  const paintCubeSingle = (position: coordinateData) => {
    let cubeEle = document.getElementById(position.coor);
    if (!cubeEle) return;
    cubeEle.style.backgroundColor = position.color;
  };
  const eraseCubeSingle = (position: { coor: string }) => {
    let cubeEle = document.getElementById(position.coor);
    if (!cubeEle) return;
    cubeEle.style.backgroundColor = "transparent";
  };

  const eraseAllCube = () => {
    let cubeList = [...document.querySelectorAll(".cube")];
    cubeList.forEach((item) => {
      let cubeEle = document.getElementById(item.id);
      if (!cubeEle) return;
      cubeEle.style.backgroundColor = "transparent";
    });
  };

  const eraseEnd = (e: any) => {
    setIsPainting(false);
    if (!canvaTouchEnable(e)) return;
  };
  const paintEnd = (e: any) => {
    setIsPainting(false);
    if (!canvaTouchEnable(e)) return;
    let allCubeData = detectList.map((item) => {
      return getCubeId(item);
    });
    let bbfgb = R.flatten(allCubeData);
    // console.log("allCubeData", allCubeData);
    // console.log("bbfgb", bbfgb);
    bbfgb.forEach((item: any, index) => {
      if (!item) return;
      tempList.push({ coor: item.id, color: item.color });
    });
    // console.log('tempList', tempList)
    setList(R.uniq(tempList));
    setDetectList([]);
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
      // setList([]);
      resetList();
      setGalleryModalShow(true);
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
          paintCubeSingle({ coor: item.coor, color: item.color });
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
    // console.log("item", item);
    resetList();
    setGalleryModalShow(false);
    setTimeout(() => {
      setCurrentPicked(item);
      setShowText(true);
    }, 500);
  };

  const exportData = (item: paintDataFromLocal) => {
    const content = JSON.stringify({
      listData: item.listData,
      canvaColor: item.canvaColor ? item.canvaColor : canvaColor
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

    let demoList = [starryNight, wantItAll];
    let tempObj = { ...demoList[demoIndex], id: "", thumbnail: "" };
    // setList([]);
    resetList();
    setCurrentPicked(tempObj);
    setShowText(true);
    setSpeed(5);

    let count = starryNight.listData.length;
    // console.log('count', count)
    let tempIndex = 0;
    if (demoIndex === 1) {
      tempIndex = 0;
    } else {
      tempIndex = 1;
    }
    setDemoIndex(tempIndex);
    setTimeout(() => {
      // console.log('prevSpeed', prevSpeed)
      setSpeed(prevSpeed);
    }, count * speed);
  };

  const changePenWidth = (item: number) => {
    setPenWidth(item);
    setShowPenWidthMenu(false);
  };

  const changeSpeedLevel = (item: number) => {
    setSpeed(item);
    setShowSpeedMenu(false);
  };

  const resizePalmRejectionPanel = (behavior: string) => {
    let tempIndex = palmRejectSizeIndex;
    switch (behavior) {
      case "minus":
        console.log("縮小");
        if (tempIndex !== 0) {
          tempIndex--;
          console.log("tempIndex", tempIndex);
          setPalmRejectSizeIndex(tempIndex);
        }
        break;
      case "add":
        console.log("放大");
        if (tempIndex !== 3) {
          tempIndex++;
          console.log("tempIndex", tempIndex);
          setPalmRejectSizeIndex(tempIndex);
        }
        break;

      default:
        break;
    }
  };

  const getTouchBehavior = (e: any) => {
    // console.log("e", e);
    // console.log("e.touches", e.touches);
    // console.log("e.touches[0]", e.touches[0]);
    if (!e.touches.length) return "";
    // console.log('getTouchBehavior_e.touches[0].radiusX', e.touches[0].radiusX)
    const roundTo = (num: number, decimal: number) => {
      return (
        Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) /
        Math.pow(10, decimal)
      );
    };
    const radius = roundTo(Number(e.touches[0].radiusX), 1);

    // return radius;
    if (radius > 1) {
      return "finger";
    } else {
      return "stylus";
    }
  };

  const visitGallery = () => {
    setGalleryModalShow(true);
    // setSetupPanelShow(false);
    let setupPanelEle = document.querySelector(".setup_panel_container");
    if (!setupPanelEle) return;
    let parentElement = setupPanelEle.parentElement;
    if (!parentElement) return;
    console.log('parentElement', parentElement)
    parentElement.classList.add("hide");
  };

  const closeGalleryModal = () => {
    if (galleryModalShow) {
      let setupPanelEle = document.querySelector(".setup_panel_container");
      if (!setupPanelEle) return;
      let parentElement = setupPanelEle.parentElement;
      if (!parentElement) return;
      console.log('parentElement', parentElement)
      parentElement.classList.remove("hide");
    }
    setGalleryModalShow(false);
  };

  const startBounce = () => {
    let toggleEle = document.getElementById("touchBehavior");
    if (!toggleEle) return;
    toggleEle.classList.add("must_bounce");

    setTimeout(() => {
      if (!toggleEle) return;
      toggleEle.classList.remove("must_bounce");
    }, 3500);
  }

  const closeTouchTipModal = () => {
    setTouchTipShow(false);
    startBounce();
  }

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
              onClick={() => visitGallery()}
            >
              Gallery
            </div>
            <div
              className={`btn setup_btn ${enable ? "" : "disable"} ${
                setupPanelShow ? "active" : ""
              }`}
              onClick={() => setSetupPanelShow(!setupPanelShow)}
            >
              Setup
            </div>
          </div>
        </div>
        <div className="wrap_outer">
          <div
            className="wrap"
            // draggable={true}
            ref={wrapRef}
            onTouchStart={(e) => touchStart(e)}
            onTouchMove={(e) => (eraseMode ? eraseMove(e) : paintMove(e))}
            onTouchEnd={(e) => (eraseMode ? eraseEnd(e) : paintEnd(e))}
            style={{ backgroundColor: canvaColor }}
          >
            {renderCube()}
          </div>
        </div>
      </div>
      {prevDataFromLocal.length && galleryModalShow ? (
        <ModalTool
          modalShow={galleryModalShow}
          modalCloseFunction={() => closeGalleryModal()}
          modalWidth={"unset"}
          modalHeight={"500px"}
          modalInnerBackground={"#ffffff20"}
          backgroundOpacity={0.5}
          background={"#000000"}
          zIndex={12}
        >
          <GalleryPanel
            prevDataFromLocal={prevDataFromLocal}
            listPanelRef={listPanelRef}
            enable={enable}
            play={play}
            exportData={exportData}
            deleteThisPaint={deleteThisPaint}
            setGalleryModalShow={setGalleryModalShow}
            closeGalleryModal={closeGalleryModal}
          ></GalleryPanel>
        </ModalTool>
      ) : null}
      {touchTipShow ? (
        <ModalTool
          modalShow={touchTipShow}
          modalCloseFunction={() => setTouchTipShow(false)}
          modalWidth={"200px"}
          modalHeight={"120px"}
          modalInnerBackground={"#0c1a2a"}
          backgroundOpacity={0.5}
          background={"#000000"}
          zIndex={12}
        >
          <div className="touch_tip_wrap">
          <div className="touch_tip_text">
            若欲使用{touchBehavior === "finger" ? "觸控筆" : "指尖"}
            繪圖<br/>請修改設定
          </div>
          <div
              className={`btn touch_tip_btn ${enable ? "" : "disable"}`}
              onClick={()=>closeTouchTipModal()}
            >
              Yes
            </div>
          </div>
          


        </ModalTool>
      ) : null}

      <DragPanel
        id={"functionPanel"}
        background={"transparent"}
        childStartX={0.08}
        childStartY={0.1}
        show={setupPanelShow}
        setShow={setSetupPanelShow}
      >
        <SetupPanel
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
          palmRejectShow={palmRejectShow}
          setPalmRejectShow={setPalmRejectShow}
          touchBehavior={touchBehavior}
          setTouchBehavior={setTouchBehavior}
        />
      </DragPanel>
      {/* <DragPanel
        id={"palmRejectionPanel"}
        background={"transparent"}
        childStartX={0.65}
        childStartY={0.1}
        show={palmRejectShow}
        setShow={setPalmRejectShow}
        dragDisable={isPainting}
      >
        <div
          className="palm_rejection"
          style={{
            width: `${palmRejectSizeList[palmRejectSizeIndex].w}px`,
            height: `${palmRejectSizeList[palmRejectSizeIndex].h}px`
          }}
        >
          <div className="resize_btn_area">
            <div
              className={`resize_btn ${
                palmRejectSizeIndex === 0 ? "disable" : ""
              }`}
              onClick={() => resizePalmRejectionPanel("minus")}
            >
              -
            </div>
            <div
              className={`resize_btn ${
                palmRejectSizeIndex === 2 ? "disable" : ""
              }`}
              onClick={() => resizePalmRejectionPanel("add")}
            >
              +
            </div>
          </div>
        </div>
      </DragPanel> */}
    </div>
  );
};
// palmRejectSizeList  ,palmRejectSizeIndex  ,setPalmRejectSizeIndex
