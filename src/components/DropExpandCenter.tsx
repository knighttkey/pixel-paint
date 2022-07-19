import "./../styles/DropExpandCenter.scss";

type Props = {
  showMenu: Boolean;
  setShowMenu: Function;
  defaultValue: number;
  menuList: number[];
  action: Function;
};

export default (props: Props) => {
  const { showMenu, setShowMenu, defaultValue, menuList, action } = props;
  return (
    <div className="dropdown_container_expand_center">
      <div
        className={`dropdown_bg ${showMenu ? "show_bg" : "hide_bg"}`}
        onClick={() => setShowMenu(!showMenu)}
      ></div>
      <div className="dropdown_body">
        <div className={`default_area ${showMenu ? 'hide':''}`} onClick={() => setShowMenu(!showMenu)}>
          {defaultValue}
        </div>
        <div className={`unfold_area ${showMenu ? "unfold" : ""}`}>
          {menuList.map((item, index) => {
            return (
              <div
                className={`each_item ${item === defaultValue ? 'current_item':''}`}
                key={index}
                onClick={() => action(item)}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
