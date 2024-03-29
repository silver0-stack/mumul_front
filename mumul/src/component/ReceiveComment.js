import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import "moment/locale/ko";
import More from "./../img/icon/icMore.png";
import Bin from "./../img/icon/icBin.png";
import Comment from "./../img/icon/icChat.png";
import AnonymousAnswer from "./AnonymousAnswer";
import Delete from "./popup/QDelete";
import { getPReceivedComment } from "../api/Q&A/getPReceivedComment";
import { getSpaceInfo } from "../api/getSpaceInfo";
import UntilAnswering from "./UntilAnswering";
import AnswerRegister from "./popup/AnswerRegister";
import CantModal from "./popup/CantRegister";
import ADelete from "./popup/ADelete";
import Profile5 from "./../img/Ellipse 105.png";
import Loading from "./Loading";
import PropTypes from 'prop-types';

// TODO : spaceId 근원 트랙킹하기 -> undefined 해

function ReceiveComment({ spaceId, currentUserInfo }) {
  const [page, setPage] = useState(0); // 페이지 번호 상태값 추가
  const [pageSize, setPageSize] = useState(5); // 페이지 크기 상태값 추가
  const [loading, setLoading] = useState(false); // 로딩 상태값 추가
  const [allDataFetched, setAllDataFetched] = useState(false); // 모든 데이터를 가져왔는지 여부를 나타내는 상태값 추가
  const [fetchingMoreData, setFetchingMoreData] = useState(false);
  const [receivedComments, setReceivedComments] = useState([]);
  // 질문 삭제 상태값
  const [deleteStates, setDeleteStates] = useState([]);
  // 답변 삭제 상태값
  const [a_deleteStates, a_setDeleteStates] = useState([]);

  // 질문 공유 상태값
  const [shareStates, setShareStates] = useState({});

  //질문 삭제 모달 오픈 상태값
  const [delModal, setDelModal] = useState(false);
  //답변 삭제 모달 오픈 상태값
  const [a_delModal, a_setDelModal] = useState(false);
  //등록불가 모달 오픈 상태값
  const [cantModal, setCantModal] = useState(false);
  const [answerModal, setAnswerModal] = useState(false);

  // 선택한 답변의 고유 ID를 상태값에 저장
  const [selectedAnswerId, setSelectedAnswerId] = useState([]);

  // 선택한 질문의 고유 ID를 상태값에 저장
  const [selectedQuestionId, setSelectedQuestionId] = useState([]);

  const [selectedQuestionUserId, setSelectedQuestionUserId] = useState([]);
  const [selectedQuestionUserPic, setSelectedQuestionPic] = useState([]);
  const [selectedQuestionText, setSelectedQuestionText] = useState([]);

  // 선택한 질문의 스페이스 ID와 유저 ID를 상태값에 저장
  const [selectedSpaceId, setSelectedSpaceId] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);

  // More 아이콘 드롭다운 오픈 여부 상태값
  const [q_openedDropdownIndex, q_setOpenedDropdownIndex] = useState([]);
  const [a_openedDropdownIndex, a_setOpenedDropdownIndex] = useState([]);

  // 이동한 스페이스 상태값
  const [spaceOwner, setSpaceOwner] = useState({
    userId: "",
    picture: "",
    name: "",
  });

  const fetchData = async (isInitialFetch = true) => {
    try {
      setLoading(true);

      // isInitialFetch가 true일 경우에만 페이지 번호를 초기화
      if (isInitialFetch) {
        setPage(0);
      }

      const spaInfo = await getSpaceInfo(spaceId);
      const response = await getPReceivedComment(spaceId, page, pageSize);

     // newComments가 정의되지 않았다면 빈 배열로 초기화
      const newComments = isInitialFetch
        ? response.data
        : [...receivedComments, ...response.data];
      setReceivedComments(newComments);
      setSpaceOwner(spaInfo);

      // deleteStates 배열을 모든 질문에 대해 초기화
      // fix: newComments의 undefined 을 매핑하는 문제 해결
      const initialDeleteStates = newComments.map(() => false);

      setDeleteStates(initialDeleteStates);
      a_setDeleteStates(initialDeleteStates);
      setShareStates(initialDeleteStates);

      // 모든 데이터를 불러온 경우에는 더 이상 데이터를 불러오지 않도록 설정
      if (response.data.length === 0) {
        setAllDataFetched(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const spinnerRef = useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, pageSize]);

  useEffect(() => {
    const fetchDataOnScroll = async () => {
      if (!fetchingMoreData && !allDataFetched) {
        setFetchingMoreData(true);

        const response = await getPReceivedComment(spaceId, page + 1, pageSize);

        setFetchingMoreData(false);

        if (response.data.length === 0) {
          setAllDataFetched(true);
          return; // 더 이상 데이터를 불러올 필요가 없으므로 종료
        }

        setReceivedComments((prevData) => [
          ...prevData,
          ...response.data.map((item) => ({ ...item, key: item.id })),
        ]);
        setPage((prevPage) => prevPage + 1);
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const contentHeight = document.body.scrollHeight;

      if (scrollY >= contentHeight - windowHeight - 200) {
        fetchDataOnScroll();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [spaceId, page, pageSize, allDataFetched, fetchingMoreData]);

  // 클릭한 질문에 대한 삭제 상태값 변경
  const clickMore = (index) => {
    q_setOpenedDropdownIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
    a_setOpenedDropdownIndex(null); // Close answer modal if any is open
    setDeleteStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  // 클릭한 답변에 대한 삭제 상태값 변경
  const clickMore_1 = (index) => {
    a_setOpenedDropdownIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
    q_setOpenedDropdownIndex(null); // Close question modal if any is open
    a_setDeleteStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  // // 클릭한 질문에 대한 공유하기 상태값 변경
  // const clickMore_s = (index) => {
  //   setShareStates((prevStates) => {
  //     const newStates = [...prevStates];
  //     newStates[index] = !newStates[index];
  //     return newStates;
  //   });
  // };

  // 질문 삭제하기 클릭 시 모달 오픈
  const showDelModal = (questionId, spaceId, userId) => {
    // 삭제하기 드랍다운 지우기
    setDeleteStates("");
    setSelectedQuestionId(questionId); // 선택한 질문의 ID를 상태값에 저장
    setSelectedSpaceId(spaceId); // 선택한 질문의 스페이스 ID를 상태값에 저장
    setSelectedUserId(userId); // 선택한 질문의 유저 ID를 상태값에 저장
    setDelModal(true);
  };

  // 답변 삭제하기 클릭 시 모달 오픈
  const a_showDelModal = (answerId, spaceId, userId) => {
    setSelectedAnswerId(answerId); // 선택한 질문의 ID를 상태값에 저장
    setSelectedSpaceId(spaceId); // 선택한 질문의 스페이스 ID를 상태값에 저장
    setSelectedUserId(userId); // 선택한 질문의 유저 ID를 상태값에 저장
    a_setDelModal(true);
  };

  // 두번째 답변 등록 시 모달 오픈
  const showCantModal = () => {
    setCantModal(true);
  };

  // 삭제 팝업  닫기
  const onClose = (e) => {
    setDelModal(false);
    a_setDelModal(false);
    setCantModal(false);
    // setShare(false);
  };

  //공유하기  오픈
  // const showShareModal = (questionId) => {
  //   setSelectedQuestionId(questionId); // 선택한 질문의 ID를 상태값에 저장
  //   setShare(true);
  // };

  const showAnswerModal = (
    questionId,
    sentUserId,
    sentUserPic,
    questionText
  ) => {
    setAnswerModal(true);
    setSelectedQuestionId(questionId); // 선택한 질문의 ID를 상태값에 저장
    setSelectedQuestionUserId(sentUserId); // 선택한 질문의 유저 아이디를 상태값에 저장
    setSelectedQuestionPic(sentUserPic); // 선택한 질문의 유저 사진값을 상태값에 저장
    setSelectedQuestionText(questionText); // 선택한 질문의 내용 상태값에 저장
  };

  const closeAnswerModal = () => {
    setAnswerModal(false);
  };

  return (
    <>
      {receivedComments.length === 0 && (
        <>
         <div className="placeholder">
            <div className="profileArea">
              <img src={Profile5} alt="profile1" className="pre_questioner" />
            </div>
            <div className="cnt">
              <p className="pre_Nickname">익명의 토끼</p>
              <p className="pre_min">언젠가</p>
              <p className="pre_commentCnt">
              <span role="img" aria-label="link">
                받은 질문이 없어요🤖 첫 무물의 주인공이 되어 보세요!
                </span>
              </p>
            </div>
          </div>
        </>
      )}
      {receivedComments.slice().map((received, index) => (
        <React.Fragment key={received.id}>
          <div
            key={received.id}
            className={
              received.answers.length > 0
                ? "commentWrap questionWrap"
                : "pre"
            }
          >
            <div className="profileArea">
              <img
                src={received.sentUserPic}
                alt="profile1"
                className={`questioner ${
                  received.isAnonymous ? "anonymous" : ""
                }`}
                onClick={() => {
                  if (!received.isAnonymous) {
                    window.location.href = `/${received.sendingUserId}`;
                  }
                }}
              />
            </div>
            <div className="cnt">
              <p className="Nicname">{received.userId}</p>
              <p className="min">{getTimeDifference(received.createdTime)}</p>
              <p className="commentCnt">{received.questionText}</p>
              <div className="heart">
                {received.answers.length > 0 ? (
                  received.receivingUserId === currentUserInfo.userId && (
                    <img
                      src={Comment}
                      alt="comment"
                      className="chat"
                      onClick={showCantModal}
                    />
                  )
                ) : (
                  <>
                    {currentUserInfo.userId !== spaceOwner.userId ? (
                      ""
                    ) : (
                      <img
                        src={Comment}
                        alt="comment"
                        className="chat"
                        onClick={() =>
                          showAnswerModal(
                            received.id,
                            received.userId,
                            received.sentUserPic,
                            received.questionText
                          )
                        }
                      />
                    )}
                  </>
                )}
              </div>

              {
                // 1. 내 스페이스의 질문일 때 currentUserInfo.userId === spaceOwner.userId
                // 2. 내가 작성한 질문, 답변일 때 currentUserInfo.userId === received.userId
              }
              <div className="more">
                {currentUserInfo.userId === spaceOwner.userId ||
                currentUserInfo.userId === received.sendingUserId ? (
                  <img src={More} alt="more" onClick={() => clickMore(index)} />
                ) : (
                  ""
                )}
                {deleteStates[index] && (
                  <div
                    className="del"
                    onClick={() =>
                      showDelModal(received.id, spaceId, currentUserInfo.userId)
                    }
                  >
                    <p>
                      <img src={Bin} alt="btin" />
                      삭제하기
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="commentWrap answerWrap">
            <div className="profileArea">
              {received.answers.length === 0 ? (
                <img
                  src={spaceOwner.picture}
                  alt="profile2"
                  className="pre_questioner"
                />
              ) : (
                <img
                  src={spaceOwner.picture}
                  alt="profile2"
                  className="respondent"
                  onClick={() => {
                    if (spaceId !== received.answers[0].userId.toString()) {
                      window.location.href = `/${received.answers[0].userId}`;
                    }
                  }}
                />
              )}
            </div>
            <div className="cnt">
              {received.answers.length === 0 ? (
                <p className="pre_Nickname">{spaceOwner.name}</p>
              ) : (
                <p className="Nicname">{spaceOwner.name}</p>
              )}

              {received.answers.length === 0 ? (
                <UntilAnswering></UntilAnswering>
              ) : (
                <>
                  <p className="min">
                    {getTimeDifference(received.answers[0].createdTime)}
                  </p>
                  <AnonymousAnswer
                    question={received}
                    answers={received.answers}
                    currentUserInfo={currentUserInfo}
                  />
                </>
              )}

              {received.answers.length === 0 ? (
                ""
              ) : (
                <>
                  <div className="more">
                    {currentUserInfo.userId === received.answers[0].userId ? (
                      <img
                        src={More}
                        alt="more"
                        onClick={() => clickMore_1(index)}
                      />
                    ) : (
                      ""
                    )}

                    {a_deleteStates[index] && (
                      <div
                        className="del"
                        onClick={() =>
                          a_showDelModal(
                            received.answers[0].id,
                            spaceId,
                            currentUserInfo.userId
                          )
                        }
                      >
                        <p>
                          <img src={Bin} alt="btin" />
                          삭제하기
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 질문 삭제하기 팝업  */}
            {delModal && (
              <Delete
                questionId={selectedQuestionId}
                spaceId={selectedSpaceId} // 스페이스 ID 전달
                userId={selectedUserId} // 유저 ID 전달
                onClose={onClose}
              ></Delete>
            )}
            {/* 답변 삭제하기 팝업  */}
            {a_delModal && (
              <ADelete
                answerId={selectedAnswerId}
                spaceId={selectedSpaceId} // 스페이스 ID 전달
                userId={selectedUserId} // 유저 ID 전달
                onClose={onClose}
              ></ADelete>
            )}
            {/* -- 등록불가 팝업 */}
            {cantModal && <CantModal onClose={onClose}></CantModal>}
          </div>
        </React.Fragment>
      ))}
      {answerModal && (
        <AnswerRegister
          CloseAnswerModal={closeAnswerModal}
          currentUserInfo={currentUserInfo}
          questionId={selectedQuestionId}
          sentUserId={selectedQuestionUserId}
          sentUserPic={selectedQuestionUserPic}
          questionText={selectedQuestionText}
        ></AnswerRegister>
      )}
      {loading && <Loading />}
      <div ref={spinnerRef} />
    </>
  );
}

ReceiveComment.propTypes = {
  spaceId: PropTypes.string.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
};


export default ReceiveComment;

// 질문 등록 시간과 현재 시간 사이의 차이를 계산하는 함수
function getTimeDifference(createdTime) {
  return moment(createdTime).locale("ko").fromNow();
}
