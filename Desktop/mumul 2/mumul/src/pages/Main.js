import React, { useState, useEffect, useRef } from "react";
import Header from "../component/Header";
import SendCommnet from "../component/SendCommnet";
import ReceiveComment from "../component/ReciveComment";
import MyProfile from "../component/MyProfile";
import Storyslide from "../component/Storyslide";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../api/getUserInfo";
// import QuestionerProfile from "../component/QuestionerProfile";

// Main 매개변수로 {isLogin} 넣어주어야함.
function Main() {
  // const navigate = useNavigate();
  // const [info, setInfo] = useState({
  //   email: '',
  //   name: ''
  // });

  // useEffect(() => {
  //   if(!isLogin) navigate('/login');

  //   const initUserInfo = async () => {
  //     const newInfo = await getUserInfo();
  //     setInfo(newInfo);
  //   };
  //   initUserInfo();
  // }, [isLogin]);

  const [activeIndex, setActiveIndex] = useState(0);

  const tabContArr = [
    {
      id: 0,
      tabTitle: "받은 질문",
      tabCont: <ReceiveComment></ReceiveComment>,
    },
    {
      id: 1,
      tabTitle: "보낸 질문",
      tabCont: <SendCommnet></SendCommnet>,
    },
  ];
  return (
    <div className="wrap">
      <Header></Header>
      <div className="contentWrap">
        <Storyslide></Storyslide>
        {/*  로그인 : 본인 일 때  */}
        <MyProfile></MyProfile>
        {/* -- 로그인 자 본인 일 때 -- */}

        {/*  로그인 : 질문자 일 때 */}
        {/* <QuestionerProfile></QuestionerProfile> */}
        {/*  -- 로그인 : 질문자 일 때  --*/}
        <ul className="tabMenu">
          {tabContArr.map((item) => (
            <li
              className={activeIndex === item.id ? "is-active" : ""}
              onClick={() => setActiveIndex(item.id)}
              key={item.id}
            >
              {item.tabTitle}
            </li>
          ))}
        </ul>
        <div>
          {tabContArr
            .filter((item) => activeIndex === item.id)
            .map((item) => (
              <div key={item.id}>{item.tabCont}</div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Main;
