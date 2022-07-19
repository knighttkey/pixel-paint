import React from "react";
import "./../styles/GalleryPanel.scss";
import { paintDataFromLocal } from "./PixelPainter";
import deleteIcon from "/images/icon_delete.svg";
import closeIcon from "/images/xmark.svg";

type Props = {
  prevDataFromLocal: paintDataFromLocal[];
  listPanelRef: any;
  enable: Boolean;
  play: Function;
  exportData: Function;
  deleteThisPaint: Function;
  setGalleryModalShow: Function;
  closeGalleryModal: Function;
  setSpeedChangeModalShow: Function;
  setCurrentPicked:Function;
  prepareToExportVideo:Function;
};

export default (props: Props) => {
  const {
    prevDataFromLocal,
    listPanelRef,
    enable,
    play,
    exportData,
    deleteThisPaint,
    setGalleryModalShow,
    closeGalleryModal,
    setSpeedChangeModalShow,
    setCurrentPicked,
    prepareToExportVideo
  } = props;
  const scrollList = (e: any) => {
    e.stopPropagation();
  };

  const prepareToPlay = (item:paintDataFromLocal) => {
    setCurrentPicked(item);
    setSpeedChangeModalShow(true)
  }
  return (
    <div className="list_panel_container">
      <div className="list_panel_header">
        筆跡紀錄
        <div className="close_btn">
          <div
            className="close_icon"
            style={{ backgroundImage: `url(${closeIcon})` }}
            onClick={() => closeGalleryModal()}
          ></div>
        </div>
      </div>
      <div
        className="list_panel_wrap"
        ref={listPanelRef}
        onScroll={(e) => scrollList(e)}
      >
        <div className="list_panel_inner">
          {prevDataFromLocal.map((item, index) => {
            return (
              <div className="each_row" key={index}>
                {/* <div className="data_id">{item.id}</div> */}
                <div className="data_id">{index + 1}</div>
                <img className="thumbnail" src={item.thumbnail}></img>
                <div
                  className={`play_btn ${enable ? "" : "disable"}`}
                  onClick={() => prepareToPlay(item)}
                >
                  Play
                </div>

                <div
                  className={`export_btn  ${enable ? "" : "disable"}`}
                  onClick={() => exportData(item)}
                >
                  ExportPath
                </div>
                <div
                  className={`delete_icon  ${enable ? "" : "disable"}`}
                  style={{ backgroundImage: `url(${deleteIcon})` }}
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
