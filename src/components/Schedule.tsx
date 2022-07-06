import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect
} from "react";
import "./../styles/Schedule.scss";
import * as R from "ramda";
import * as htmlToImage from "html-to-image";
import deleteIcon from '/images/icon_delete.svg';
type DragPoint = {
  x: number;
  y: number;
};
interface ColorPickTarget extends EventTarget {
  value: string;
}
interface paintDataFromLocal {
  id: string;
  listData: coordinateData[];
  thumbnail: string;
}

interface coordinateData {
  coor: string;
  color: string;
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<coordinateData[]>([]);
  const [showText, setShowText] = useState<boolean>(false);
  const [prevDataFromLocal, setPrevDataFromLocal] = useState<
    paintDataFromLocal[]
  >([]);
  const [detectList, setDetectList] = useState<DragPoint[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#ccff00");
  const [currentPicked, setCurrentPicked] = useState<paintDataFromLocal>();
  const [speed, setSpeed] = useState<number>(15);
  // console.log("detectList", detectList);
  // console.log("list", list);
  // console.log("prevDataFromLocal", prevDataFromLocal);

  const reportWindowSize = (event:any) => {
    let rootContainer:HTMLDivElement | null = document.querySelector(".pixel_canva_container");
    console.log('rootContainer', rootContainer)
    if(!rootContainer) return;
    if (event.type === "load") {
      rootContainer.style.setProperty("--main-width", window.outerWidth.toString());
    } else {
      rootContainer.style.setProperty("--main-width", window.innerWidth.toString());
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
    // console.log("刪除且寫入");
  };

  const allList = new Array(35).fill(0).map((item, key) => {
    return new Array(35).fill(0).map((key) => {
      return key + 1;
    });
  });

  let tempList = [...list];

  const resetList = () => {
    setList([]);
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
      return { ele: targetEle, id: targetEle.id, color: currentColor };
    } catch (err) {
      console.log("err", err);
    }
  };
  useEffect(() => {
    if (detectList.length) {
      let lastChanged = handleReturnCubeId(detectList[detectList.length - 1]);
      // console.log("lastChanged", lastChanged);
      if (lastChanged) {
        // if (
        //   R.includes(
        //     lastChanged.id,
        //     tempList.map((item) => {
        //       return item.coor;
        //     })
        //   )
        // ) {
        //   let index = tempList
        //     .map((item) => {
        //       return item.coor;
        //     })
        //     .indexOf(lastChanged.id);
        //   // console.log("index", index);
        //   if (index >= 0) {
        //     tempList[index].color = lastChanged.color;
        //   }
        // } else {
        tempList.push({ coor: lastChanged.id, color: lastChanged.color });
        // }
        setList(tempList);
      }
    }
  }, [detectList]);

  let temp = [...detectList];
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!wrapRef.current) return;
    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    let coor = { x: clientXX, y: clientYY };

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
      list.forEach((item, index) => {
        let cubeEle = document.getElementById(item.coor);
        if (cubeEle) {
          cubeEle.style.backgroundColor = item.color;
        }
      });
    } else {
      let cubeList = [...document.querySelectorAll(".cube")];
      cubeList.forEach((item, index) => {
        let cubeEle = document.getElementById(item.id);
        if (cubeEle) {
          cubeEle.style.backgroundColor = "transparent";
        }
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
        thumbnail: thumbnail
      }
    ];
    // console.log("prepare", prepare);
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

  useEffect(() => {
    if (showText) {
      tempList = [];
      // console.log("currentPicked", currentPicked);
      currentPicked?.listData.forEach((item, key) => {
        setTimeout(() => {
          tempList.push({ coor: item.coor, color: item.color });
          setList([...tempList]);
        }, speed * key);
        setCurrentPicked(undefined);
        setShowText(false);
      });
    }
  }, [showText]);

  const play = (item: paintDataFromLocal) => {
    setList([]);
    setCurrentPicked(item);
    setShowText(true);
  };
  const changeColor = (eventTarget: ColorPickTarget) => {
    setCurrentColor(eventTarget.value);
  };

  const saveThumbnail = () => {
    return new Promise<string>((resolve, reject) => {
      if (!wrapRef.current) return;
      // htmlToImage
      //   .toBlob(wrapRef.current, { pixelRatio: 0.1, quality: 0.1 })
      //   .then((blob: any) => {
      //     // console.log("blob", blob);
      //     let urlCreator = window.URL || window.webkitURL;
      //     let imageUrl = urlCreator.createObjectURL(blob);
      //     // console.log("imageUrl", imageUrl);
      //     resolve(imageUrl);
      //   })
      //   .catch(function (error) {
      //     console.error("oops, something went wrong!", error);
      //     reject();
      //   });
      htmlToImage
        .toPng(wrapRef.current, { pixelRatio: 0.1, quality: 0.1 })
        .then(function (dataUrl:string) {
          var img = new Image();
          // img.src = dataUrl;
          resolve(dataUrl);
        })
        .catch(function (error:any) {
          console.error("oops, something went wrong!", error);
          reject();
        });
    });
  };

  return (
    <div className="pixel_canva_container">
      <div className="paint_body">
        <div
          className="wrap"
          // draggable={true}
          ref={wrapRef}
          onTouchMove={(e) => handleTouchMove(e)}
        >
          {renderCube()}
        </div>
        <div className="btn_area">
          <input
            type="color"
            id="head"
            name="head"
            value={currentColor}
            className="color_picker"
            onChange={(e) => changeColor(e.target)}
          />
          <input
            type="number"
            className="speed_input"
            onChange={(e) => setSpeed(Number(e.target.value))}
          ></input>
          <div className="reset_btn" onClick={resetList}>
            Reset
          </div>
          <div className="show_btn" onClick={save}>
            Save
          </div>
        </div>
      </div>
      {prevDataFromLocal.length ? (
        <div className="list_panel">
          <div className="list_panel_header">筆跡紀錄</div>
          <div className="list_panel_wrap" ref={listPanelRef}>
            <div className="list_panel_inner">
              {prevDataFromLocal.map((item, index) => {
                return (
                  <div className="each_row" key={index}>
                    {/* <div className="data_id">{item.id}</div> */}
                    <div className="data_id">{index + 1}</div>
                    <img className="thumbnail" src={item.thumbnail}></img>
                    <div className="play_btn" onClick={() => play(item)}>
                      Play
                    </div>
                    <div
                      className="delete_icon"
                      style={{backgroundImage:`url(${deleteIcon})`}}
                      onClick={() => deleteThisPaint(item.id)}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
