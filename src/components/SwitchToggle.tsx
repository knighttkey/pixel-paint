import "./../styles/SwitchToggle.scss";

type Props = {
  toggleOn: Boolean;
  switchAction:Function;
  setToggleOn:Function;
};

export default (props: Props) => {
  const { toggleOn,switchAction,setToggleOn } = props;

  const handleSwitch = () => {
    switchAction();
    setToggleOn(!toggleOn);
  };

  return (
    <div className="switch_toggle_container">
      <div className={`toggle_wrap ${toggleOn ? "on" : ""}`}
        onClick={() => handleSwitch()}
      >
        <div className={`toggle_button  ${toggleOn ? "on" : ""}`}></div>
      </div>
      {/* <div className={`status_text ${toggleOn ? "on" : ""}`}>{toggleOn ? 'Erase' : 'Draw'}</div> */}
    </div>
  );
};
