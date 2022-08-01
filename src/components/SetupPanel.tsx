import "./../styles/SetupPanel.scss";
import DropExpand from "./DropExpand";
import SwitchToggle from "./SwitchToggle";
import undoIcon from "/images/rotate-left.svg";
type Props = {
  canvaColor: string;
  changeCanvaColor: Function;
  currentColor: string;
  changeColor: Function;
  showSpeedMenu: Boolean;
  setShowSpeedMenu: Function;
  speed: number;
  changeSpeedLevel: Function;
  showPenWidthMenu: Boolean;
  setShowPenWidthMenu: Function;
  penWidth: number;
  changePenWidth: Function;
  eraseMode: Boolean;
  setEraseMode: Function;
  palmRejectShow:Boolean;
  setPalmRejectShow:Function;
  touchBehavior:string, 
  setTouchBehavior: Function;
  prevStep:Function;
};

export default (props: Props) => {
  const {
    canvaColor,
    changeCanvaColor,
    currentColor,
    changeColor,
    showSpeedMenu,
    setShowSpeedMenu,
    speed,
    changeSpeedLevel,
    showPenWidthMenu,
    setShowPenWidthMenu,
    penWidth,
    changePenWidth,
    eraseMode,
    setEraseMode,
    palmRejectShow,
    setPalmRejectShow,
    touchBehavior,
    setTouchBehavior,
    prevStep
  } = props;
  
  const srokeWidthList = [1, 2, 3, 4, 5, 6];
  const speedList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const switchTouchBehavior = () => {
    if(touchBehavior === 'finger') {
      setTouchBehavior('stylus');
    } else {
      setTouchBehavior('finger');
    }
  }

  const removeBounce = () => {
    let toggleEle = document.getElementById('touchBehavior');
    if(!toggleEle) return;
    toggleEle.classList.remove('must_bounce');
  }



  return (
    <div className="setup_panel_container">
      <div className="title">畫布參數</div>
      <div className="function">
        <div className="area color_area">
          <div className="color_tip">Canva</div>
          <input
            type="color"
            value={canvaColor}
            className="color_picker"
            onChange={(e) => changeCanvaColor(e.target)}
          />
        </div>
        <div className="area color_area">
          <div className="color_tip">Color</div>
          <input
            type="color"
            value={currentColor}
            className="area color_picker"
            onChange={(e) => changeColor(e.target)}
          />
        </div>
        {/* <div className="area speed_area">
          <div className="speed_tip">Speed</div>
          <DropExpand
            showMenu={showSpeedMenu}
            setShowMenu={setShowSpeedMenu}
            defaultValue={speed}
            menuList={speedList}
            action={changeSpeedLevel}
          ></DropExpand>
        </div> */}
        <div className="area stroke_area">
          <div className="stroke_tip">Stroke</div>

          <DropExpand
            showMenu={showPenWidthMenu}
            setShowMenu={setShowPenWidthMenu}
            defaultValue={penWidth}
            menuList={srokeWidthList}
            action={changePenWidth}
          ></DropExpand>
        </div>
        <div className="area erase_area">
          <div className="erase_tip">Erase</div>
          <SwitchToggle
            toggleOn={eraseMode}
            switchAction={() => {}}
            setToggleOn={setEraseMode}
          ></SwitchToggle>
        </div>
        {/* <div className="area palm_reject_area">
          <div className="palm_reject_tip">Palm</div>
          <SwitchToggle
            toggleOn={palmRejectShow}
            switchAction={() => {}}
            setToggleOn={setPalmRejectShow}
          ></SwitchToggle>
        </div> */}
        <div className={`area touch_type_area ${touchBehavior === 'stylus'?'custom_green':''}`} id='touchBehavior'>
          <div className={`touch_type_tip ${touchBehavior==='finger' ? '' :'custom_green'}`}>{touchBehavior=== 'finger' ? 'Finger':'Stylus'}</div>
          <SwitchToggle
            toggleOn={touchBehavior === 'finger'? true:false}
            switchAction={() => removeBounce()}
            setToggleOn={switchTouchBehavior}
            customGreen={true}
          ></SwitchToggle>
        </div>
        <div className="area prev_step_area">
          <div className="prev_step_tip">Undo</div>

          <div className="prev_btn"  onClick={()=>prevStep()}>
            {/* Prev */}
            <div className="prev_icon" style={{ backgroundImage: `url(${undoIcon})` }}></div>

          </div>
        </div>
      </div>
    </div>
  );
};