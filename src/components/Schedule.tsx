import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect
} from "react";
import "./../styles/Schedule.scss";
import * as R from "ramda";

type DragPoint = {
  x: number;
  y: number;
};

interface ClickEventTarget extends EventTarget {
  id: string;
}
interface TouchEventTarget extends EventTarget {
  id: string;
}
interface ColorPickTarget extends EventTarget {
  value: string;
}
interface paintDataFromLocal {
  id: string;
  listData: coordinateData[];
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
  const [selectMode, setSelectMode] = useState<Boolean>(true);
  const [prevDataFromLocal, setPrevDataFromLocal] = useState<
    paintDataFromLocal[]
  >([]);
  const [detectList, setDetectList] = useState<DragPoint[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [currentPicked, setCurrentPicked] = useState<paintDataFromLocal>();
  // console.log("detectList", detectList);
  // console.log("list", list);
  // console.log("prevDataFromLocal", prevDataFromLocal);

  useEffect(() => {
    getDataAgain();
  }, []);

  const getDataAgain = () => {
    let prevData = window.localStorage.getItem("pixelData");
    // console.log('prevData', prevData)
    let prevList = prevData ? JSON.parse(prevData) : [];
    console.log("prevList", prevList);
    setPrevDataFromLocal(prevList);
  };

  const deleteThisPaint = (id: string) => {
    let tempList = [...prevDataFromLocal];
    let modified = tempList.filter((item) => {
      return item.id !== id;
    });
    setPrevDataFromLocal(modified);
    window.localStorage.setItem("pixelData", JSON.stringify(modified));
    console.log("刪除且寫入");
  };

  const allList = new Array(35).fill(0).map((item, key) => {
    return new Array(35).fill(0).map((key) => {
      return key + 1;
    });
  });

  // //點擊選取
  // const pickCube = (eventTarget: ClickEventTarget) => {
  //   if (selectMode) {
  //     tempList.push({coor:eventTarget.id, color:'#ccff00'});
  //     setList(tempList);
  //   } else {
  //     tempList = R.without([eventTarget.id], list);
  //     setList(tempList);
  //   }
  // };
  let tempList = [...list];

  const resetList = () => {
    setList([]);
  };

  const handleReturnCubeId = (coorItem: DragPoint) => {
    // console.log("coorItem", coorItem);
    if (!wrapRef.current) return;
    let cubeList = [...document.querySelectorAll(".cube")];
    let parentRect = wrapRef.current.getBoundingClientRect();
    try {
      return cubeList.filter((cubeItem, cubeIndex) => {
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
      })[0].id;
    } catch (err) {
      console.log("err", err);
    }
  };
  useEffect(() => {
    if (detectList.length) {
      let lastChanged = handleReturnCubeId(detectList[detectList.length - 1]);
      if (lastChanged) {
        if (
          R.includes(
            lastChanged,
            tempList.map((item) => {
              return item.coor;
            })
          )
        ) {
        } else {
          tempList.push({ coor: lastChanged, color: "#ccff00" });
          setList(tempList);
        }
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

  const renderScheduleCube = () => {
    return allList.map((dayItem, key) => {
      return (
        <div key={key} className="hour">
          {dayItem.map((cubeItem, cubeKey) => {
            return (
              <div
                className={`cube ${
                  R.includes(
                    `cube_${key + 1}-${cubeKey + 1}`,
                    list.map((item) => {
                      return item.coor;
                    })
                  )
                    ? "selected"
                    : ""
                }`}
                id={`cube_${key + 1}-${cubeKey + 1}`}
                key={cubeKey}
              ></div>
            );
          })}
        </div>
      );
    });
  };

  const save = () => {
    let prepare = [
      ...prevDataFromLocal,
      { listData: list, id: new Date().getTime().toString() }
    ];
    console.log("prepare", prepare);
    window.localStorage.setItem("pixelData", JSON.stringify(prepare));
    console.log("儲存");
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
      console.log("currentPicked", currentPicked);
      currentPicked?.listData.forEach((item, key) => {
        setTimeout(() => {
          tempList.push({ coor: item.coor, color: "#ccff00" });
          setList([...tempList]);
        }, 30 * key);
        setCurrentPicked(undefined);
        setShowText(false);
      });
    }
  }, [showText]);

  const play = (item: paintDataFromLocal) => {
    console.log("item", item);
    console.log("play");
    // setList([]);
    setCurrentPicked(item);
    setShowText(true);
  };
  const changeColor = (eventTarget: ColorPickTarget) => {
    setCurrentColor(eventTarget.value);
  };

  return (
    <div className="pixel_canva_container">
      <div className="paint_body">
        <div
          className="wrap"
          draggable={true}
          ref={wrapRef}
          onTouchMove={(e) => handleTouchMove(e)}
        >
          {renderScheduleCube()}
        </div>
        <div className="btn_area">
          <input
            type="color"
            id="head"
            name="head"
            value="#ccff66"
            className="color_picker"
            onChange={(e) => changeColor(e.target)}
          />
          <div className="reset_btn" onClick={resetList}>
            Reset
          </div>
          <div className="show_btn" onClick={save}>
            Save
          </div>
        </div>
      </div>

      <div className="list_panel" ref={listPanelRef}>
        <div className="list_panel_inner" >
          {prevDataFromLocal.map((item, index) => {
            return (
              <div className="each_row" key={index}>
                {/* <div className="data_id">{item.id}</div> */}
                <div className="data_id">{index + 1}</div>

                <div className="play_btn" onClick={() => play(item)}>
                  Play
                </div>
                <div
                  className="delete_icon"
                  onClick={() => deleteThisPaint(item.id)}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
