import "./../styles/HistoryPanel.scss";
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
  historyModalShow: Boolean;
  setHistoryModalShow: Function;
};

export default (props: Props) => {
  const {
    prevDataFromLocal,
    listPanelRef,
    enable,
    play,
    exportData,
    deleteThisPaint,
    historyModalShow,
    setHistoryModalShow
  } = props;

  return (
    <div className="list_panel_container">
      <div className="list_panel_header">
        筆跡紀錄
        <div className="close_btn">
          <div
            className="close_icon"
            style={{ backgroundImage: `url(${closeIcon})` }}
            onClick={() => setHistoryModalShow(false)}
          ></div>
        </div>
      </div>
      <div className="list_panel_wrap" ref={listPanelRef}>
        <div className="list_panel_inner">
          {prevDataFromLocal.map((item, index) => {
            return (
              <div className="each_row" key={index}>
                {/* <div className="data_id">{item.id}</div> */}
                <div className="data_id">{index + 1}</div>
                <img className="thumbnail" src={item.thumbnail}></img>
                <div
                  className={`play_btn ${enable ? "" : "disable"}`}
                  onClick={() => play(item)}
                >
                  Play
                </div>

                <div
                  className={`export_btn  ${enable ? "" : "disable"}`}
                  onClick={() => exportData(item)}
                >
                  Export
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
