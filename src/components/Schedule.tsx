import { DragEvent, useRef, useState, MouseEvent, useEffect } from "react";
import "./../styles/Schedule.scss";
import * as R from "ramda";
import moment from "moment";
import transparent from '/images/transparent.png';
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

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lastPoint, setLastPoint] = useState<DragPoint>();
  const [list, setList] = useState<string[]>([]);
  const [showText, setShowText] = useState<boolean>(false);
  // console.log("list", list);

  const cancelDefault = (e: DragEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const dragover = (e: DragEvent) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = "move";
    cancelDefault(e);
  };

  const allList = new Array(20).fill(0).map((item, key) => {
    return new Array(20).fill(0).map((key) => {
      return key + 1;
    });
  });

  //點擊選取
  const pickCube = (eventTarget: ClickEventTarget) => {
    if (R.includes(eventTarget.id, list)) {
      tempList = R.without([eventTarget.id], list);
      setList(tempList);
    } else {
      tempList.push(eventTarget.id);
      setList(tempList);
    }
  };
  let tempList = [...list];

  //框選選取
  const moveStart = (
    // e: DragEvent| React.TouchEvent,
    e: any,
    accordingX: number,
    accordingY: number,
    eventType: string
  ) => {
    e.stopPropagation();
    if(eventType === "dragstart") {
      // if (e instanceof DragEvent && e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          var img = new Image();
          img.src = transparent;
          e.dataTransfer.setDragImage(img, 0, 0);
      // }

    }
    if (!wrapRef.current) return;
    const parentRect = wrapRef.current.getBoundingClientRect();
    let rectPatchX = accordingX - parentRect.left;
    let rectPatchY = accordingY - parentRect.top;

    let selectAreaEle = document.createElement("div");
    selectAreaEle.id = "selectArea";
    selectAreaEle.style.left = rectPatchX + "px";
    selectAreaEle.style.top = rectPatchY + "px";

    wrapRef.current.appendChild(selectAreaEle);
    selectAreaEle.dataset.patchX = rectPatchX.toString();
    selectAreaEle.dataset.patchY = rectPatchY.toString();
  };

  // const touchOver = (eventTarget:TouchEventTarget) => {
  //   console.log('eventTarget.id', eventTarget.id)
  //   if(eventTarget) {
  //     tempList.push(eventTarget.id);
  //     console.log('tempList', tempList)
  //     setList(R.uniq(tempList));
  //   }
  // }

  const move = (e: DragEvent | React.TouchEvent, accordingX: number, accordingY: number, eventType: string) => {
    if (!accordingX && !accordingY) return;
    if (!wrapRef.current) return;
    const parentRect = wrapRef.current.getBoundingClientRect();

    let targetEle = document.getElementById("selectArea");

    let dragPositionX = accordingX - parentRect.left;
    if (dragPositionX < 0) {
      dragPositionX = 0;
    } else {
      if (dragPositionX > parentRect.width) {
        dragPositionX = parentRect.width;
      }
    }

    let dragPositionY = accordingY - parentRect.top;
    if (dragPositionY < 0) {
      dragPositionY = 0;
    } else if (dragPositionY > parentRect.height) {
      dragPositionY = parentRect.height;
    }
    if (targetEle) {
      const patchX = targetEle.dataset.patchX;
      const patchY = targetEle.dataset.patchY;
      let moveX = dragPositionX - Number(patchX);
      let moveY = dragPositionY - Number(patchY);


      let direction = "";
        if (moveX > 0 && moveY > 0) {
          direction = "x+y+";
        } else if (moveX > 0 && moveY < 0) {
          direction = "x+y-";
        } else if (moveX < 0 && moveY > 0) {
          direction = "x-y+";
        } else if (moveX < 0 && moveY < 0) {
          direction = "x-y-";
        }


      if (moveX < 0) {
        targetEle.style.left = "unset";
        targetEle.style.right = parentRect.width - Number(patchX) + "px";
      } else {
        targetEle.style.left = Number(patchX) + "px";
        targetEle.style.right = "unset";
        if (moveX >= parentRect.width) {
          moveX = parentRect.right - Number(patchX);
        }
      }

      if (moveY < 0) {
        targetEle.style.top = "unset";
        targetEle.style.bottom = parentRect.height - Number(patchY) + "px";
      } else {
        targetEle.style.top = Number(patchY) + "px";
        targetEle.style.bottom = "unset";
        if (moveY >= parentRect.height) {
          moveY = parentRect.bottom - Number(patchY);
        }
      }

      targetEle.style.width = Math.abs(moveX) + "px";
      // targetEle.style.height = Math.abs(moveY) + "px";
      targetEle.style.height = Math.abs(moveY) + "px";

      //---------------------------------------------------------------------------
      detectBeSelect(
        { x: Number(patchX), y: Number(patchY) },
        { x: dragPositionX, y: dragPositionY },
        parentRect,
        direction,
        eventType
      );
    }

    setLastPoint({ x: dragPositionX, y: dragPositionY });
  };

  const moveEnd = (e: DragEvent | React.TouchEvent) => {
      cancelDefault(e);
      let targetEle = document.getElementById("selectArea");
      if (targetEle) {
        if (wrapRef.current && lastPoint) {
          const parentRect = wrapRef.current.getBoundingClientRect();
          const patchX = targetEle.dataset.patchX;
          const patchY = targetEle.dataset.patchY;
          let moveX = lastPoint.x - Number(patchX);
          let moveY = lastPoint.y - Number(patchY);
          // let direction = "";
          // if (moveX > 0 && moveY > 0) {
          //   direction = "x+y+";
          // } else if (moveX > 0 && moveY < 0) {
          //   direction = "x+y-";
          // } else if (moveX < 0 && moveY > 0) {
          //   direction = "x-y+";
          // } else if (moveX < 0 && moveY < 0) {
          //   direction = "x-y-";
          // }
          // detectBeSelect(
          //   { x: Number(patchX), y: Number(patchY) },
          //   { x: lastPoint.x, y: lastPoint.y },
          //   parentRect,
          //   direction
          // );
          if (targetEle) {
            targetEle.remove();
            targetEle.dataset.patchX = "";
            targetEle.dataset.patchY = "";
          }
        }
      }
  };

  //判斷被選取的時刻方塊
  const detectBeSelect = (
    startPoint: DragPoint,
    lastPoint: DragPoint,
    parentRect: DOMRect,
    direction: string,
    eventType: string
    ) => {
      let cubeList = [...document.querySelectorAll(".cube")];
      console.log('lastPoint', lastPoint)

    cubeList.forEach((cubeItem, cubeIndex) => {
      let cubeRect = cubeItem.getBoundingClientRect();

      let cubeLeft = cubeRect.left - parentRect.left;
      let cubeRight = cubeRect.right - parentRect.left;
      let cubeTop = cubeRect.top - parentRect.top;
      let cubeBottom = cubeRect.bottom - parentRect.top;

      switch (direction) {
        case "x+y+":
          if (
            startPoint.x <= cubeRight &&
            cubeLeft <= lastPoint.x &&
            startPoint.y <= cubeBottom &&
            cubeTop <= lastPoint.y
          ) {
            tempList.push(cubeItem.id);
            setList(R.uniq(tempList));
          }
          break;
        case "x+y-":
          if (
            startPoint.x <= cubeRight &&
            cubeLeft <= lastPoint.x &&
            startPoint.y >= cubeTop &&
            cubeBottom >= lastPoint.y
          ) {
            tempList.push(cubeItem.id);
            setList(R.uniq(tempList));
          }
          break;
        case "x-y+":
          if (
            startPoint.x >= cubeLeft &&
            cubeRight >= lastPoint.x &&
            startPoint.y <= cubeBottom &&
            cubeTop <= lastPoint.y
          ) {
            tempList.push(cubeItem.id);
            setList(R.uniq(tempList));
          }
          break;
        case "x-y-":
          if (
            startPoint.x >= cubeLeft &&
            cubeRight >= lastPoint.x &&
            startPoint.y >= cubeTop &&
            cubeBottom >= lastPoint.y
          ) {
            tempList.push(cubeItem.id);
            setList(R.uniq(tempList));
          }
          break;

        default:
          break;
      }
    });
  };

  const resetList = () => {
    setList([]);
  };

  //結構渲染
  const renderHoursName = () => {
    return (
      <div className="hours_cube_wrap">
        {allList.map((item, key) => {
          return (
            <div className="hours_cube" key={key}>
              {key + 1}
            </div>
          );
        })}
      </div>
    );
  };
  const renderDaysName = () => {
    return (
      <div className="days_cube_wrap">
        {allList[0].map((item, key) => {
          return (
            <div className="days_cube" key={key}>
              {key+1}
              {/* {moment()
                .startOf("week")
                .isoWeekday(key + 1)
                .format("ddd")
                .toUpperCase()} */}
            </div>
          );
        })}
      </div>
    );
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
                // onTouchMove={(e)=>touchOver({...e.target, id: `cube_${key + 1}-${cubeKey + 1}`})}
              ></div>
            );
          })}
        </div>
      );
    });
  };

  const worldNekoDay = [
    //世
    "cube_3-4",
    "cube_4-4",
    "cube_5-4",
    "cube_6-4",
    "cube_7-4",
    "cube_8-4",
    "cube_9-4",
    "cube_6-2",
    "cube_6-3",
    "cube_6-5",
    "cube_6-6",
    "cube_6-7",
    "cube_6-8",
    "cube_8-2",
    "cube_8-3",
    "cube_8-5",
    "cube_8-6",
    "cube_8-7",
    "cube_8-8",
    "cube_7-8",
    "cube_4-2",
    "cube_4-3",
    "cube_4-5",
    "cube_4-6",
    "cube_4-7",
    "cube_4-8",
    "cube_4-9",
    "cube_4-10",
    "cube_5-10",
    "cube_6-10",
    "cube_7-10",
    "cube_8-10",
    "cube_9-10",
    //界
    "cube_12-2",
    "cube_12-3",
    "cube_12-4",
    "cube_12-5",
    "cube_12-6",
    "cube_13-2",
    "cube_14-2",
    "cube_15-2",
    "cube_16-2",
    "cube_17-2",
    "cube_18-2",
    "cube_18-3",
    "cube_18-4",
    "cube_18-5",
    "cube_18-6",
    "cube_13-4",
    "cube_14-4",
    "cube_15-4",
    "cube_16-4",
    "cube_17-4",
    "cube_15-3",
    "cube_15-5",
    "cube_15-6",
    "cube_13-6",
    "cube_14-6",
    "cube_16-6",
    "cube_17-6",
    "cube_13-7",
    "cube_14-7",
    "cube_12-8",
    "cube_16-7",
    "cube_17-7",
    "cube_17-8",
    "cube_18-8",
    "cube_13-8",
    "cube_13-9",
    "cube_12-10",
    "cube_17-9",
    "cube_17-10",
    //貓
    "cube_22-2",
    "cube_21-3",
    "cube_24-2",
    "cube_23-3",
    "cube_22-4",
    "cube_21-5",
    "cube_23-5",
    "cube_23-6",
    "cube_23-7",
    "cube_23-8",
    "cube_23-9",
    "cube_22-10",
    "cube_21-10",
    "cube_22-7",
    "cube_21-8",
    "cube_26-2",
    "cube_26-3",
    "cube_26-4",
    "cube_25-3",
    "cube_27-3",
    "cube_28-3",
    "cube_29-3",
    "cube_28-2",
    "cube_28-4",
    "cube_25-5",
    "cube_25-6",
    "cube_25-7",
    "cube_25-8",
    "cube_25-9",
    "cube_25-10",
    "cube_26-5",
    "cube_27-5",
    "cube_28-5",
    "cube_29-5",
    "cube_29-6",
    "cube_29-7",
    "cube_29-8",
    "cube_29-9",
    "cube_29-10",
    "cube_26-7",
    "cube_27-7",
    "cube_28-7",
    "cube_27-6",
    "cube_27-8",
    "cube_27-9",
    "cube_26-10",
    "cube_27-10",
    "cube_28-10",
    //の
    "cube_36-3",
    "cube_36-4",
    "cube_36-5",
    "cube_36-6",
    "cube_36-7",
    "cube_35-7",
    "cube_34-8",
    "cube_33-8",
    "cube_32-7",
    "cube_32-6",
    "cube_32-5",
    "cube_32-4",
    "cube_33-3",
    "cube_34-2",
    "cube_35-2",
    "cube_36-2",
    "cube_37-2",
    "cube_38-3",
    "cube_39-4",
    "cube_39-5",
    "cube_39-6",
    "cube_39-7",
    "cube_39-8",
    "cube_38-9",
    "cube_37-10",
    "cube_36-10",
    "cube_35-10",
    //日
    "cube_42-2",
    "cube_42-3",
    "cube_42-4",
    "cube_42-5",
    "cube_42-6",
    "cube_42-7",
    "cube_42-8",
    "cube_42-9",
    "cube_42-10",
    "cube_43-2",
    "cube_44-2",
    "cube_45-2",
    "cube_46-2",
    "cube_47-2",
    "cube_48-2",
    "cube_48-3",
    "cube_48-4",
    "cube_48-5",
    "cube_48-6",
    "cube_48-7",
    "cube_48-8",
    "cube_48-9",
    "cube_48-10",
    "cube_43-6",
    "cube_44-6",
    "cube_45-6",
    "cube_46-6",
    "cube_47-6",
    "cube_43-10",
    "cube_44-10",
    "cube_45-10",
    "cube_46-10",
    "cube_47-10"
  ];

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

  const show = () => {
    setShowText(true);
  };

  return (
    <div className="schedule_container">
      <div className="schedule_header">{renderHoursName()}</div>
      <div className="schedule_body">
        {renderDaysName()}
        <div
          className="wrap"
          onDragEnter={(e) => cancelDefault(e)}
          onDragOver={(e) => dragover(e)}
          onDragStart={(e) => moveStart(e, e.clientX, e.clientY, e.type)}
          onDrag={(e) => move(e, e.clientX, e.clientY,  e.type)}
          onDragEnd={(e) => moveEnd(e)}
          onTouchStart={e => moveStart(e, e.touches[0].clientX, e.touches[0].clientY, e.type)}
          onTouchMove={e => move(e, e.touches[0].clientX, e.touches[0].clientY,  e.type)}
          onTouchEnd={e => moveEnd(e)}
          draggable={true}
          ref={wrapRef}
        >
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
      </div>
    </div>
  );
};
