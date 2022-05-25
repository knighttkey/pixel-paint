import { DragEvent, useRef, useState, MouseEvent } from 'react';
import './../styles/Schedule.scss';
import * as R from 'ramda';
import moment from "moment";

type DragPoint = {
  x: number;
  y: number;
};


interface ClickEventTarget extends EventTarget {
  id:string;
}

export default () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lastPoint, setLastPoint] = useState<DragPoint>();
  const [list, setList] = useState<string[]>([]);
  console.log('list', list);

  const cancelDefault = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const dragover = (e: DragEvent) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = 'move';
    cancelDefault(e);
  };

  const allList = new Array(24).fill(0).map((item, key) => {
    return new Array(7).fill(0).map((key) => {
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
    e: DragEvent,
    accordingX: number,
    accordingY: number,
    eventType: string,
  ) => {
    e.stopPropagation();
    if (eventType === 'dragstart') {
      e.dataTransfer.effectAllowed = 'move';
      var img = new Image();
      img.src = './images/transparent.png';
      e.dataTransfer.setDragImage(img, 0, 0);
    }
    if (!wrapRef.current) return;
    const parentRect = wrapRef.current.getBoundingClientRect();
    let rectPatchX = accordingX - parentRect.left;
    let rectPatchY = accordingY - parentRect.top;

    let selectAreaEle = document.createElement('div');
    selectAreaEle.id = 'selectArea';
    selectAreaEle.style.left = rectPatchX + 'px';
    selectAreaEle.style.top = rectPatchY + 'px';

    wrapRef.current.appendChild(selectAreaEle);
    selectAreaEle.dataset.patchX = rectPatchX.toString();
    selectAreaEle.dataset.patchY = rectPatchY.toString();
  };

  const move = (e: DragEvent, accordingX: number, accordingY: number) => {
    if (!accordingX && !accordingY) return;
    if (!wrapRef.current) return;
    const parentRect = wrapRef.current.getBoundingClientRect();

    let targetEle = document.getElementById('selectArea');

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

      if (moveX < 0) {
        targetEle.style.left = 'unset';
        targetEle.style.right = parentRect.width - Number(patchX) + 'px';
      } else {
        targetEle.style.left = Number(patchX) + 'px';
        targetEle.style.right = 'unset';
        if (moveX >= parentRect.width) {
          moveX = parentRect.right - Number(patchX);
        }
      }

      if (moveY < 0) {
        targetEle.style.top = 'unset';
        targetEle.style.bottom = parentRect.height - Number(patchY) + 'px';
      } else {
        targetEle.style.top = Number(patchY) + 'px';
        targetEle.style.bottom = 'unset';
        if (moveY >= parentRect.height) {
          moveY = parentRect.bottom - Number(patchY);
        }
      }

      targetEle.style.width = Math.abs(moveX) + 'px';
      targetEle.style.height = Math.abs(moveY) + 'px';
    }

    setLastPoint({ x: dragPositionX, y: dragPositionY });
  };

  const moveEnd = (e: DragEvent) => {
    cancelDefault(e);
    let targetEle = document.getElementById('selectArea');
    if (targetEle) {
      if (wrapRef.current && lastPoint) {
        const parentRect = wrapRef.current.getBoundingClientRect();
        const patchX = targetEle.dataset.patchX;
        const patchY = targetEle.dataset.patchY;
        let moveX = lastPoint.x - Number(patchX);
        let moveY = lastPoint.y - Number(patchY);
        let direction = '';
        if (moveX > 0 && moveY > 0) {
          direction = 'x+y+';
        } else if (moveX > 0 && moveY < 0) {
          direction = 'x+y-';
        } else if (moveX < 0 && moveY > 0) {
          direction = 'x-y+';
        } else if (moveX < 0 && moveY < 0) {
          direction = 'x-y-';
        }
        detectBeSelect(
          { x: Number(patchX), y: Number(patchY) },
          { x: lastPoint.x, y: lastPoint.y },
          parentRect,
          direction,
        );
        if (targetEle) {
          targetEle.remove();
          targetEle.dataset.patchX = '';
          targetEle.dataset.patchY = '';
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
  ) => {
    let cubeList = [...document.querySelectorAll('.cube')];

    cubeList.forEach((cubeItem, cubeIndex) => {
      let cubeRect = cubeItem.getBoundingClientRect();

      let cubeLeft = cubeRect.left - parentRect.left;
      let cubeRight = cubeRect.right - parentRect.left;
      let cubeTop = cubeRect.top - parentRect.top;
      let cubeBottom = cubeRect.bottom - parentRect.top;

      switch (direction) {
        case 'x+y+':
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
        case 'x+y-':
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
        case 'x-y+':
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
        case 'x-y-':
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
  }

  //結構渲染
  const renderHoursName = () => {
    return (
      <div className="hours_cube_wrap">
        {allList.map((item, key) => {
          return <div className="hours_cube" key={key}>{key + 1}</div>;
        })}
      </div>
    );
  };
  const renderDaysName = () => {
    return (
      <div className="days_cube_wrap">
        {allList[0].map((item, key) => {
          return <div className="days_cube" key={key}>{moment().startOf('week').isoWeekday(key+1).format("ddd").toUpperCase()}</div>;
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
                    ? 'selected'
                    : ''
                }`}
                id={`cube_${key + 1}-${cubeKey + 1}`}
                key={cubeKey}
                onClick={(e) => pickCube({...e.target, id:`cube_${key + 1}-${cubeKey + 1}`})}
              ></div>
            );
          })}
        </div>
      );
    });
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
          onDrag={(e) => move(e, e.clientX, e.clientY)}
          onDragEnd={(e) => moveEnd(e)}
          draggable={true}
          ref={wrapRef}
        >
          {renderScheduleCube()}
        </div>
      </div>
      <div className="reset_btn" onClick={resetList}>Reset</div>
    </div>
  );
};
