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
import starryNight from "./../../jsonFile_2022_07_21_A.json";
import wantItAll from "./../../jsonFile_2022_07_21_B.json";
import wretched from "./../../jsonFile_2022_07_21_C.json";
import DragPanel from "./DragPanel";
import GalleryPanel from "./GalleryPanel";
import ModalTool from "./ModalTool";
import SetupPanel from "./SetupPanel";
import moment from "moment";
// import Dropdown from "./Dropdown";
import DropExpandCenter from "./DropExpandCenter";

type DragPoint = {
  x: number;
  y: number;
};
interface ColorPickTarget extends EventTarget {
  value: string;
}
export interface paintDataFromLocal {
  id: string;
  listData: coordinateData[][];
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

interface WholeData {
  ele: HTMLDivElement;
  id: string;
  color: string;
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<coordinateData[][]>([]);
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
  const [showSpeedMenuBeforePlay, setShowSpeedMenuBeforePlay] =
    useState<Boolean>(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [galleryModalShow, setGalleryModalShow] = useState(false);
  const [setupPanelShow, setSetupPanelShow] = useState(true);
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [palmRejectShow, setPalmRejectShow] = useState<Boolean>(false);
  const [palmRejectSizeIndex, setPalmRejectSizeIndex] = useState<number>(0);
  const [isPainting, setIsPainting] = useState<Boolean>(false);
  const [touchBehavior, setTouchBehavior] = useState<string>("finger");
  const [touchTipShow, setTouchTipShow] = useState<Boolean>(false);
  const [loadingModalShow, setLoadingModalShow] = useState<Boolean>(false);
  const [cubeDivide, setCubeDivide] = useState<number>(50);
  const [speedChangeModalShow, setSpeedChangeModalShow] =
    useState<Boolean>(false);
  const [downloadEnable, setDownloadEnable] = useState(false);
  const [offsetListForNext, setOffsetListForNext] = useState<coordinateData[][]>([]);
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

  const allList = new Array(cubeDivide).fill(0).map((item, key) => {
    return new Array(cubeDivide).fill(0).map((key) => {
      return key + 1;
    });
  });

  let tempList = [...list];

  const resetList = () => {
    setList([]);
    setCanvaColor("transparent");
    eraseAllCube();
    setDownloadEnable(false);
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
                style={{
                  width: `${700 / cubeDivide}px`,
                  height: `${700 / cubeDivide}px`
                }}
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
    let coor = { x: Math.floor(clientXX), y: Math.floor(clientYY) };

    let eraseChanged = getCubeId(coor)?.map(item=>{
      if (!item) return;
      return { coor: item.id };
    });
    // console.log("eraseChanged", eraseChanged);
    
      if(!eraseChanged) return;
      let fla = R.flatten(eraseChanged.map((i)=>{
        if(!i) return;
        return i.coor;
      }));

      let prepare = [...list];
      let eraseResult = prepare.map((i,key)=>{
        i.forEach(k => {
          if(R.includes(k.coor, fla)) {
            eraseCubeSingle(k);
          }
        })
        return (i.filter((j)=>{
          return(
            !R.includes(j.coor, fla)
            )
          }))
        }).filter((i)=>{
          return i.length;
        })
        prepare = eraseResult;
        setList(prepare);
  };

  useEffect(() => {
    if (detectList.length) {
      // console.log("detectList", detectList);
      let lastChanged = getCubeId(detectList[detectList.length - 1]);
      // console.log("lastChanged", lastChanged);
      if (lastChanged) {
        // console.log("lastChanged", lastChanged);
        let modify = lastChanged.map((item: any) => {
          return { coor: item.id, color: item.color };
        });
        if (!modify) return;
        paintCube(modify);
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

  const paintCube = (positionArray: coordinateData[]) => {
    positionArray.forEach((positionItem) => {
      let cubeEle = document.getElementById(positionItem.coor);
      if (!cubeEle) return;
      cubeEle.style.backgroundColor = positionItem.color;
    });
  };
  const prevCube = (positionArray: coordinateData[]) => {
    positionArray.forEach((positionItem) => {
      let cubeEle = document.getElementById(positionItem.coor);
      if (!cubeEle) return;
      cubeEle.style.backgroundColor = "transparent";
    });
  };
  const eraseCubeSingle = (position: coordinateData) => {
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
    // if (!canvaTouchEnable(e)) return;
    let allCubeData = R.uniq(detectList.map((item) => {
      return getCubeId(item);
    }));
    // console.log("allCubeData", allCubeData);
    allCubeData.forEach((item: any, index) => {
      if (!item) return;
      let innerObject = item.map((innerItem: WholeData) => {
        return { coor: innerItem.id, color: innerItem.color };
      });
      tempList.push(innerObject);
    });
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
      setSetupPanelShow(false);
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
    tempList = [];
    // setList([]);
    resetList();
  };

  const readFile = (e: any) => {
    let files = e.target.files;
    console.log(files);

    let reader = new FileReader();
    reader.onload = (r: any) => {
      //  console.log(r.target.result);
      try {
        let toParse = JSON.parse(r.target.result);
        // console.log("toParse", toParse);
        // console.log("toParse.listData", toParse.listData);
        setList(toParse.listData);
        let listFromFile: coordinateData[][] = toParse.listData;
        listFromFile.forEach((item, key) => {
          setTimeout(() => {
            const coorFormatArray = item.map((innerItem) => {
              return { coor: innerItem.coor, color: innerItem.color };
            });
            console.log("coorFormatArray", coorFormatArray);
            paintCube(coorFormatArray);
          }, speed * key);
        });
        setDownloadEnable(true);

        setCanvaColor(toParse.canvaColor);
      } catch (parseErr) {
        console.log("parseErr", parseErr);
      }
    };
    reader.readAsText(files[0]);
    e.target.value = "";
  };

  // console.log('enable', enable)

  // useEffect(()=>{
  //   function sort(ddate:any) {
  //     return ddate.sort(() => Math.random() - 0.5);
  //   }
  //   let final = sort(ddate);
  //   console.log('final', final)
  //   console.log('finalToJson', JSON.stringify(final))
  // },[])

  useEffect(() => {
    if (showText) {
      tempList = [];
      if (!currentPicked) return;
      setCanvaColor(currentPicked.canvaColor);
      setEnable(false);

      currentPicked.listData.forEach((item, key) => {
        setTimeout(() => {
          // tempList.push({ coor: item.coor, color: item.color });
          tempList.push(item);
          paintCube(item);
          // item.forEach((innerItem)=>{
          //   paintCube({ coor: innerItem.coor, color: innerItem.color });
          // })
          setList([...tempList]);
        }, speed * key);

        setCurrentPicked(undefined);
        setShowText(false);
      });
      setDownloadEnable(true);
      let count = currentPicked.listData.length;
      // console.log('count', count)
      setTimeout(() => {
        setEnable(true);
      }, count * speed);
      // console.log('count * speed', count * speed)
    }
  }, [showText]);

  // const play = (item: paintDataFromLocal) => {
  const play = () => {
    // console.log("item", item);
    setSpeedChangeModalShow(false);
    resetList();
    setGalleryModalShow(false);
    setTimeout(() => {
      // setCurrentPicked(item);
      setShowText(true);
    }, 500);
    if (!currentPicked) return;
    let count = currentPicked.listData.length;
    setTimeout(() => {
      // console.log("open");
      setSetupPanelShow(true);
      // setDownloadEnable(true);
    }, count * speed);
  };

  const exportData = (item: paintDataFromLocal) => {
    const content = JSON.stringify({
      listData: item.listData,
      canvaColor: item.canvaColor ? item.canvaColor : canvaColor
    });
    let a = document.createElement("a");
    let file = new Blob([content], { type: "text/json" });
    a.href = URL.createObjectURL(file);
    // a.download = `jsonFile_${Math.floor(Number(item.id) / 100000)}.json`;
    a.download = `jsonFile_${moment(new Date())
      .locale("zh-tw")
      .format("YYYY_MM_DD_hh_mm_ss")}.json`;
    a.click();
  };

  const changeColor = (eventTarget: ColorPickTarget) => {
    setCurrentColor(eventTarget.value);
    setEraseMode(false);
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

  // const updateFormat = () => {
  //   let demoList = [starryNight, wantItAll, wretched];
  //   // let fff = demoList[2].listData.map((item, index)=>{
  //   //   return [item];
  //   // })

  //   // let tempObj = { ...demoList[demoIndex], id: "", thumbnail: "", listData:fff, canvaColor:'#7bc6ff' };
  //   // console.log('fff', fff)
  //   let tempObj = {...demoList[demoIndex]}
  //   resetList();
  //   setCanvaColor(tempObj.canvaColor);
  //   // setList(fff);
  //   setCurrentPicked(tempObj);
  //   setShowText(true);
  // }
  const demoPlay = () => {
    let prevSpeed = speed;

    let demoList = [starryNight, wantItAll, wretched];
    let tempObj = { ...demoList[demoIndex], id: "", thumbnail: "" };
    // setList([]);
    resetList();
    setCurrentPicked(tempObj);
    setShowText(true);
    setSpeed(5);

    let count = starryNight.listData.length;
    // console.log('count', count)
    let tempIndex = 0;
    if (demoIndex === 2) {
      tempIndex = 0;
    } else {
      tempIndex = demoIndex + 1;
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
    setShowSpeedMenuBeforePlay(false);
  };

  const resizePalmRejectionPanel = (behavior: string) => {
    let tempIndex = palmRejectSizeIndex;
    switch (behavior) {
      case "minus":
        // console.log("minus");
        if (tempIndex !== 0) {
          tempIndex--;
          console.log("tempIndex", tempIndex);
          setPalmRejectSizeIndex(tempIndex);
        }
        break;
      case "add":
        // console.log("enlarge");
        if (tempIndex !== 3) {
          tempIndex++;
          // console.log("tempIndex", tempIndex);
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
    setSetupPanelShow(false);
  };

  const closeGalleryModal = () => {
    setGalleryModalShow(false);
    setSetupPanelShow(true);
  };

  const startBounce = () => {
    let toggleEle = document.getElementById("touchBehavior");
    if (!toggleEle) return;
    toggleEle.classList.add("must_bounce");

    setTimeout(() => {
      if (!toggleEle) return;
      toggleEle.classList.remove("must_bounce");
    }, 3500);
  };

  const closeTouchTipModal = () => {
    setTouchTipShow(false);
    startBounce();
  };

  // useEffect(() => {
  //   let debugListEle = document.querySelector(".debug_list");
  //   if (debugListEle) {
  //     debugListEle.scrollTo({
  //       top: Number.MAX_SAFE_INTEGER,
  //       behavior: "auto",
  //     });
  //   }
  // }, [list]);

  const handleEnlargeThisCube = (item: coordinateData) => {
    let thisId = item.coor;
    let thisCubeEle = document.getElementById(thisId);
    // console.log('thisCubeEle', thisCubeEle)
    thisCubeEle?.classList.add("enlarge");
    let cubeList = [...document.querySelectorAll(".cube")];
    cubeList
      .filter((i) => {
        return i !== thisCubeEle;
      })
      .forEach((c) => {
        c.classList.remove("enlarge");
      });
  };

  // const playFromThisFrame = (index: number, canvaColor: string) => {
  //   // console.log("index", index);
  //   let tempOrigin = [...list];
  //   let fromThisFrame = tempOrigin.filter((item, key) => {
  //     return key >= index;
  //   });
  //   // console.log("fromThisFrame", fromThisFrame);
  //   tempList = [];
  //   setList([]);
  //   eraseAllCube();
  //   setEnable(false);
  //   fromThisFrame.forEach((item, key) => {
  //     setTimeout(() => {
  //       tempList.push({ coor: item.coor, color: item.color });
  //       paintCube({ coor: item.coor, color: item.color });
  //       setList([...tempList]);
  //     }, speed * key);
  //     setCurrentPicked(undefined);
  //     // setShowText(false);
  //   });
  //   let count = fromThisFrame.length;
  //   // console.log('count', count)
  //   setTimeout(() => {
  //     setEnable(true);
  //   }, count * speed);
  // };

  // const removeThisFrame = (index: number) => {
  //   // console.log("index", index);
  //   let tempOrigin = [...list];
  //   let othersFrame = tempOrigin.filter((item, key) => {
  //     return key !== index;
  //   });
  //   othersFrame.forEach((item, index) => {
  //     paintCube({ coor: item.coor, color: item.color });
  //   });
  //   setList(othersFrame);
  // };
  const speedList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const prepareToExportVideo = () => {
    setLoadingModalShow(true);
    // const createCanvas = () => {
    //   return new Promise((resolve,reject)=>{

    const canvas = document.createElement("canvas");
    // const canvas = document.getElementById("targetCanvas");
    // if (!canvas) return;
    let appEle = document.querySelector(".App");
    console.log("appEle", appEle);
    if (!appEle) return;
    appEle.classList.add("download_time");
    // let contanierEle = document.querySelector(".paint_body");
    // console.log("contanierEle", contanierEle);
    // if (!contanierEle) return;
    // contanierEle.appendChild(canvas);
    // canvas.id = "targetCanvas";
    // canvas.style.backgroundColor = canvaColor;
    const canvaSize = 1400;
    canvas.height = canvaSize;
    canvas.width = canvaSize;
    let ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    // console.log("parentRect", parentRect);
    ctx.clearRect(0, 0, canvaSize, canvaSize);
    ctx.fillStyle = canvaColor;
    ctx.fillRect(0, 0, canvaSize, canvaSize);
    recordCanvas(canvas, (list.length + 10) * speed);
    list.forEach((item, key) => {
      // console.log("key", key, item.color, key * speed, item.coor);
      if (!ctx) return;

      setTimeout(() => {
        item.forEach((innerItem)=>{
          let ele = document.getElementById(innerItem.coor);
          // console.log("ele", ele);
          if (!ele) return;
          if (!ctx) return;
          let eleBgColor = window.getComputedStyle(ele, null).backgroundColor;
          // console.log("eleBgColor", eleBgColor);
          let eleRect = ele.getBoundingClientRect();
          // console.log("eleRect", eleRect);
          // console.log("parentRect", parentRect);
  
          let top = eleRect.top - parentRect.top;
          let left = eleRect.left - parentRect.left;
          let width = eleRect.width;
          let height = eleRect.height;
          // console.log("rect", top, left, width, height);
          ctx.fillStyle = innerItem.color;
          const scaleRatio = canvaSize / parentRect.width;
  
          ctx.fillRect(
            left * scaleRatio,
            top * scaleRatio,
            width * scaleRatio,
            height * scaleRatio
          );
        })
       
      }, key * speed);
    });
    // })
    // }
    // createCanvas().then((canvas)=>{
    //   console.log('res_canvas', canvas)

    // })
    // console.log("list.length * speed", list.length * speed);
    function recordCanvas(canvas: any, videoLength: any) {
      console.log("videoLength", videoLength);
      const recordedChunks: any = [];
      // var options = {mimeType: 'video/webm;codecs=h264'};
      var options = { mimeType: "video/webm; codecs=vp9" };
      const mediaRecorder = new MediaRecorder(
        canvas.captureStream(30),
        options
        // { mimeType: "video/webm; codecs=vp9"}
      );
      mediaRecorder.start();
      // let videoEle =document.getElementById("video");
      // if(!videoEle) return;
      // videoEle.srcObject = mediaRecorder.stream;

      // setTimeout(() => {
      mediaRecorder.ondataavailable = (event) =>
        recordedChunks.push(event.data);

      // }, 0);
      console.log("mediaRecorder", mediaRecorder);
      mediaRecorder.onstop = () => {
        console.log("recordedChunks", recordedChunks);
        //------------------------------------------------------
        // const blob = recordedChunks[0];
        // var reader = new FileReader();
        // reader.readAsDataURL(blob);
        // reader.onloadend = (w) => {
        //   console.log('w', w)
        //   console.log('w.target.result', w.target.result)
        //   const anchor = document.createElement("a");
        //   anchor.href = w.target.result;
        //   anchor.download = "video.webm";
        //   anchor.click();
        // }
        //------------------------------------------------------
        const url = URL.createObjectURL(
          new Blob(recordedChunks, { type: "video/webm" })
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "video.webm";
        anchor.click();
        window.URL.revokeObjectURL(url);
      };

      setTimeout(() => {
        mediaRecorder.stop();
        // setDownloadEnable(false);
        setLoadingModalShow(false);
        let appEle = document.querySelector(".App");
        console.log("appEle", appEle);
        if (!appEle) return;
        appEle.classList.remove("download_time");
      }, videoLength + 3000);
    }
  };

  const prevStep = () => {
    let tempListForPrev = [...list];
    tempListForPrev.splice(tempListForPrev.length - 1, 1);
    let tempListOffset = [...offsetListForNext];
    tempListOffset.push(tempListForPrev[tempListForPrev.length - 1]);
    setOffsetListForNext(tempListOffset);
    setList(tempListForPrev);
      prevCube(tempListForPrev[tempListForPrev.length - 1]);
  };

  const nextStep = () => {
    console.log('offsetListForNext', offsetListForNext)
    let aaa = [...offsetListForNext];
    console.log('aaa', aaa)
    let bbb = aaa.splice(aaa.length-1,1);
    console.log('bbb', bbb)
    let tempListForNext = [...list];
    tempListForNext.concat(bbb);
    console.log('tempListForNext', tempListForNext)
    setList(tempListForNext);
  };

  return (
    <div className="pixel_canva_container">
      <div className="paint_body">
        <div className="header">Pixel Painter</div>
        <div className="btn_area">
          <div className="btn_row">
            {/* <div className="tip_text">功能操作</div> */}
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
            {list.length ? (
              <div
                className={`btn reset_btn ${enable ? "" : "disable"}`}
                onClick={resetList}
              >
                Reset
              </div>
            ) : null}
            {list.length ? (
              <div
                className={`btn save_btn ${enable ? "" : "disable"}`}
                onClick={save}
              >
                Save
              </div>
            ) : null}

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
            {downloadEnable ? (
              <div
                className={`btn download_btn ${enable ? "" : "disable"}`}
                onClick={() => prepareToExportVideo()}
              >
                Download
              </div>
            ) : null}
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
        <canvas
          id="targetCanvas"
          style={{ zIndex: "-1", opacity: "0" }}
        ></canvas>
        {/* <video id='video' muted autoPlay style={{width:'180px', height:'320px'}}></video> */}
        {/* {downloadEnable ? (
          <button onClick={() => prepareToExportVideo()}>準備輸出</button>
        ) : null} */}
        <button onClick={() => prevStep()}>前一步</button>
        <button onClick={() => nextStep()}>下一步</button>

        {/* {list.length ? (
          <Fragment>
            <div
              className="debug_list"
              style={{
                overflow: "scroll",
                height: "300px",
                marginTop: "50px",
                position: "relative"
              }}
            >
              {list.map((item, index) => {
                return (
                  <div
                    className="each_test_row"
                    style={{ display: "flex", borderBottom: "1px solid green" }}
                    key={index}
                  >
                    <div
                      className="each_test_number"
                      style={{
                        color: "#2a8ab6",
                        fontSize: "18px",
                        textAlign: "start",
                        width: "60px"
                      }}
                    >
                      {index}
                    </div>
                    <div
                      className="each_test_coor"
                      style={{
                        color: "#fff",
                        fontSize: "18px",
                        textAlign: "start",
                        width: "100px"
                      }}
                    >
                      {item.coor}
                    </div>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: item.color,
                        marginRight: "15px"
                      }}
                    ></div>
                    <button onClick={() => handleEnlargeThisCube(item)}>
                      顯示
                    </button>
                    <button
                      onClick={() => playFromThisFrame(index, canvaColor)}
                    >
                      從此播放
                    </button>
                    <button onClick={(e) => removeThisFrame(index)}>
                      刪除此格
                    </button>
                  </div>
                );
              })}
            </div>
          </Fragment>
        ) : null} */}
        {/* <button onClick={()=>updateFormat()}>轉檔</button> */}
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
            setSpeedChangeModalShow={setSpeedChangeModalShow}
            setCurrentPicked={setCurrentPicked}
            prepareToExportVideo={prepareToExportVideo}
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
              繪圖
              <br />
              請修改設定
            </div>
            <div
              className={`btn touch_tip_btn ${enable ? "" : "disable"}`}
              onClick={() => closeTouchTipModal()}
            >
              Yes
            </div>
          </div>
        </ModalTool>
      ) : null}

      {speedChangeModalShow ? (
        <ModalTool
          modalShow={speedChangeModalShow}
          modalCloseFunction={() => setSpeedChangeModalShow(false)}
          modalWidth={"340px"}
          modalHeight={"160px"}
          modalInnerBackground={"#0c1a2a"}
          backgroundOpacity={0.5}
          background={"#000000"}
          zIndex={12}
        >
          <div
            className={`speed_change_wrap ${
              showSpeedMenuBeforePlay ? "" : "changed"
            }`}
          >
            <div className="speed_change_tip_text">
              Change Play Speed Level? (Max:1)
            </div>
            <DropExpandCenter
              showMenu={showSpeedMenuBeforePlay}
              setShowMenu={setShowSpeedMenuBeforePlay}
              defaultValue={speed}
              menuList={speedList}
              action={changeSpeedLevel}
            ></DropExpandCenter>
            <div className="btn_wrap">
              <div
                className={`btn speed_change_btn ${enable ? "" : "disable"}`}
                onClick={() => play()}
              >
                Start
              </div>
            </div>
          </div>
        </ModalTool>
      ) : null}
      {loadingModalShow ? (
        <ModalTool
          modalShow={loadingModalShow}
          modalCloseFunction={() => setLoadingModalShow(false)}
          modalWidth={"340px"}
          modalHeight={"160px"}
          modalInnerBackground={"#0c1a2a95"}
          backgroundOpacity={0.5}
          background={"#000000"}
          zIndex={12}
        >
          <div className="loading">
            <div className="loading_tip">Loading</div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </ModalTool>
      ) : null}

      {setupPanelShow ? (
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
      ) : null}
    </div>
  );
};
