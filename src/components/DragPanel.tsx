import React, { useEffect, useState } from "react";
import "./../styles/DragPanel.scss";
import closeIcon from "/images/xmark.svg";

interface Props {
  id: string;
  children: JSX.Element;
  background: string;
  childStartX: number;
  childStartY: number;
  show: Boolean;
  setShow: Function;
}
const DragPanel = (props: Props) => {
  const { id, children, background, childStartX, childStartY, show, setShow } =
    props;

  const [parentSize, setParentSize] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let parentEle = document.querySelector(".pixel_canva_container");
    if (!parentEle) return;
    let parentRect = parentEle.getBoundingClientRect();
    setParentSize({
      x: childStartX * parentRect.width,
      y: childStartY * parentRect.height
    });
  }, [childStartX, childStartY]);

  const moveStart = (
    e: React.TouchEvent,
    accordingX: number,
    accordingY: number,
    eventType: string
  ) => {
    const targetEle = document.getElementById(id);
    e.stopPropagation();
    if (!targetEle) return;
    const selfRect = targetEle.getBoundingClientRect();
    let rectPatchX = accordingX - selfRect.left;
    let rectPatchY = accordingY - selfRect.top;
    targetEle.dataset.patchX = rectPatchX.toString();
    targetEle.dataset.patchY = rectPatchY.toString();
  };

  const move = (accordingX: number, accordingY: number) => {
    const targetEle = document.getElementById(id);
    if (!targetEle) return;
    const patchX = Number(targetEle.dataset.patchX);
    const patchY = Number(targetEle.dataset.patchY);
    const selfRect = targetEle.getBoundingClientRect();
    let dragEle = document.querySelector(".pixel_canva_container");
    if (!dragEle) return;
    let parentRect = dragEle.getBoundingClientRect();

    if (accordingX) {
      let dragPositionX = accordingX - parentRect.left;
      if (dragPositionX < 0) {
        dragPositionX = 0;
      } else if (dragPositionX > parentRect.width) {
        dragPositionX = parentRect.width;
      }
      let ratioX = (dragPositionX / parentRect.width) * 100;
      if (ratioX >= 0 && ratioX <= 100) {
        let leftCount = parentRect.width * ratioX * 0.01 - patchX;
        if (leftCount >= 0 && leftCount + selfRect.width <= parentRect.width) {
          targetEle.style.left = `calc( ${ratioX}% - ${patchX}px)`;
        } else if (
          leftCount >= 0 &&
          leftCount + selfRect.width > parentRect.width
        ) {
          targetEle.style.left = `calc( ${parentRect.width}px - ${selfRect.width}px)`;
        } else if (leftCount - selfRect.width < 0) {
          targetEle.style.left = `0px`;
        } else {
          targetEle.style.left = `calc( ${ratioX}% - ${0}px)`;
        }
      }
    }

    if (accordingY) {
      let dragPositionY = accordingY - parentRect.top;
      if (dragPositionY < 0) {
        dragPositionY = 0;
      } else if (dragPositionY > parentRect.height) {
        dragPositionY = parentRect.height;
      }
      let ratioY = (dragPositionY / parentRect.height) * 100;
      if (ratioY >= 0 && ratioY <= 100) {
        let topCount = parentRect.height * ratioY * 0.01 - patchY;
        if (topCount >= 0 && topCount + selfRect.height <= parentRect.height) {
          targetEle.style.top = `calc( ${ratioY}% - ${patchY}px)`;
        } else if (
          topCount >= 0 &&
          topCount + selfRect.height > parentRect.height
        ) {
          targetEle.style.top = `calc( ${parentRect.height}px - ${selfRect.height}px)`;
        } else if (topCount - selfRect.height < 0) {
          targetEle.style.top = `0px`;
        } else {
          targetEle.style.top = `calc( ${ratioY}% - ${0}px)`;
        }
      }
    }
  };

  const moveEnd = (e: React.TouchEvent) => {
    // cancelDefault(e);
  };

  const cancelDefault = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      id={id}
      className={`drag_panel_container ${show ? "" : "hide"}`}
      onTouchStart={(e) =>
        moveStart(e, e.touches[0].clientX, e.touches[0].clientY, e.type)
      }
      onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => moveEnd(e)}
      // draggable={true}
      style={{
        background: background,
        left: parentSize.x,
        top: parentSize.y
      }}
    >
      <div className="drag_panel">
        <div className="close_btn">
          <div
            className="close_icon"
            style={{ backgroundImage: `url(${closeIcon})` }}
            onClick={()=>setShow(false)}
          ></div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DragPanel;
