import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect
} from "react";
import "./../styles/Schedule.scss";
import * as R from "ramda";
import moment from "moment";

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

interface paintDataFromLocal {
  id: string;
  listData: string[];
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lastPoint, setLastPoint] = useState<DragPoint>();
  const [list, setList] = useState<string[]>([]);
  const [showText, setShowText] = useState<boolean>(false);
  const [selectMode, setSelectMode] = useState<Boolean>(true);
  const [touchEnable, setTouchEnable] = useState<Boolean>(true);
  const [prevDataFromLocal, setPrevDataFromLocal] = useState<
    paintDataFromLocal[]
  >([]);
  // console.log("list", list);
  console.log("prevDataFromLocal", prevDataFromLocal);

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

  const allList = new Array(50).fill(0).map((item, key) => {
    return new Array(50).fill(0).map((key) => {
      return key + 1;
    });
  });

  //點擊選取
  const pickCube = (eventTarget: ClickEventTarget) => {
    if (selectMode) {
      tempList.push(eventTarget.id);
      setList(tempList);
    } else {
      tempList = R.without([eventTarget.id], list);
      setList(tempList);
    }
  };
  let tempList = [...list];

  const resetList = () => {
    setList([]);
  };

  const handleTouchMove = (
    eventTarget: TouchEventTarget,
    e: React.TouchEvent
  ) => {
    if (!wrapRef.current) return;

    let parentRect = wrapRef.current.getBoundingClientRect();
    let clientXX = e.touches[0].clientX - parentRect.left;
    let clientYY = e.touches[0].clientY - parentRect.top;
    let cubeList = [...document.querySelectorAll(".cube")];

    // let rrr = cubeList.filter((cubeItem) => {
    //   let cubeRect = cubeItem.getBoundingClientRect();
    //   let cubeLeft = cubeRect.left - parentRect.left;
    //   let cubeRight = cubeRect.right - parentRect.left;
    //   let cubeTop = cubeRect.top - parentRect.top;
    //   let cubeBottom = cubeRect.bottom - parentRect.top;
    //   return (
    //     clientXX <= cubeRight &&
    //     cubeLeft <= clientXX &&
    //     clientYY <= cubeBottom &&
    //     cubeTop <= clientYY
    //   );
    // })[0].id;
    // if(rrr) {
    //   setTouchEnable(false);
    // }
    // tempList.push(rrr);
    // setList([...R.uniq(tempList)]);
    // setTouchEnable(true);

    // console.log("rrr", rrr);

    cubeList.forEach((cubeItem, cubeIndex) => {
      let cubeRect = cubeItem.getBoundingClientRect();
      let cubeLeft = cubeRect.left - parentRect.left;
      let cubeRight = cubeRect.right - parentRect.left;
      let cubeTop = cubeRect.top - parentRect.top;
      let cubeBottom = cubeRect.bottom - parentRect.top;
      if (
        clientXX <= cubeRight &&
        cubeLeft <= clientXX &&
        clientYY <= cubeBottom &&
        cubeTop <= clientYY
      ) {
        // console.log("cubeItem.id", cubeItem.id);
        tempList.push(cubeItem.id);
        setList(tempList);
        setTouchEnable(false);
      }
    });
    setTouchEnable(true);
  };

  const renderScheduleCube = () => {
    return allList.map((dayItem, key) => {
      return (
        <div key={key} className="hour">
          {dayItem.map((cubeItem, cubeKey) => {
            return (
              <div
                className={`cube ${
                  R.includes(`cube_${key + 1}-${cubeKey + 1}`, list)
                    ? "selected"
                    : ""
                }`}
                id={`cube_${key + 1}-${cubeKey + 1}`}
                key={cubeKey}
                onClick={(e) =>
                  pickCube({
                    ...e.target,
                    id: `cube_${key + 1}-${cubeKey + 1}`
                  })
                }
                onTouchMove={(e) => {
                  touchEnable
                    ? handleTouchMove(
                        {
                          ...e.target,
                          id: `cube_${key + 1}-${cubeKey + 1}`
                        },
                        e
                      )
                    : null;
                }}
              ></div>
            );
          })}
        </div>
      );
    });
  };

  const show = () => {
    setShowText(true);
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
    }, 200);
  };

  // useEffect(() => {
  //   if (showText) {
  //     worldNekoDay.forEach((item, key) => {
  //       setTimeout(() => {
  //         tempList.push(item);
  //         setList([...tempList]);
  //       }, 100 * key);
  //     });
  //   }
  // }, [showText]);

  return (
    <div className="schedule_container">
      <div className="schedule_body">
        <div className="wrap" draggable={true} ref={wrapRef}>
          {renderScheduleCube()}
        </div>
      </div>
      <div className="btn_area">
        <div className="reset_btn" onClick={resetList}>
          Reset
        </div>
        <div className="show_btn" onClick={show}>
          Show
        </div>
        <div className="show_btn" onClick={save}>
          Save
        </div>
        {/* <div className="mode_switch_panel">
            <div className="panel_title"></div>
            <div className="panel_inner">
              <div className="button_text">開</div>
              <div
                className={`mode_switch_button ${selectMode ? 'enable' : ''}`}
                style={{ backgroundColor: '#42c6fc' }}
                onClick={() => setSelectMode(true)}
              ></div>
              <div
                className={`mode_switch_button ${!selectMode ? 'disable' : ''}`}
                style={{ backgroundColor: 'black' }}
                onClick={() => setSelectMode(false)}
              ></div>
              <div className="button_text">關</div>
            </div>
          </div> */}
      </div>
      <div className="list_panel">
        {prevDataFromLocal.map((item, index) => {
          return (
            <div className="each_row" key={index}>
              <div className="data_id">{item.id}</div>
              <div
                className="delete_btn"
                onClick={() => deleteThisPaint(item.id)}
              >
                刪除
              </div>
              <div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
