import { Box, Stack } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import useSettings from "../../hooks/useSettings";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { Typography } from "antd";

const Conversation = () => {
  const theme = useTheme();
  const boxRef = useRef(null);

  const {
    chatHistory,
    loadingHistory,
    groupChat,
    groupChatMap,
    setGroupChatMap,
    boxChatRef,
    hasMore,
    setHasMore
  } = useSettings();

  const setRefs = (element) => {
    boxRef.current = element;
    boxChatRef.current = element;
  };

  const [isFetching, setIsFetching] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  };

  const fetchMoreMessages = useCallback(async () => {
    if (isFetching) return;

    setIsFetching(true);
    const oldScrollHeight = boxRef.current.scrollHeight;
    const oldScrollTop = boxRef.current.scrollTop;

    try {
      const groupChatMapData = groupChatMap[groupChat.id] || [];
      const startID = groupChatMapData[0]?.id;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/groups/${groupChat.id}/messages?limit=20&offset=0&start_id=${startID}`
      );

      const newMessages = response.data.messages;

      if (
        newMessages.length > 0 &&
        newMessages[0].id !== groupChatMapData[0]?.id
      ) {
        setGroupChatMap((prev) => ({
          ...prev,
          [groupChat.id]: [...newMessages, ...groupChatMapData],
        }));

        // Maintain scroll position after new messages are added
        setTimeout(() => {
          if (boxRef.current) {
            const newScrollHeight = boxRef.current.scrollHeight;
            boxRef.current.scrollTop =
              newScrollHeight - oldScrollHeight + oldScrollTop;
          }
        }, 0);
      }

      // setHasMore(response.data.has_more);
    } catch (error) {
      console.error("Error fetching more messages:", error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, groupChatMap, groupChat.id, setGroupChatMap]);

  useEffect(() => {
    const handleScroll = () => {
      if (boxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = boxRef.current;
        const isBottom = scrollHeight - scrollTop === clientHeight;
        setIsAtBottom(isBottom);

        if (scrollTop < 200 && !loadingHistory && hasMore) {
          fetchMoreMessages();
        }
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200);

    if (boxRef.current) {
      boxRef.current.addEventListener("scroll", debouncedHandleScroll);
    }

    return () => {
      if (boxRef.current) {
        boxRef.current.removeEventListener("scroll", debouncedHandleScroll);
      }
    };
  }, [fetchMoreMessages, loadingHistory, hasMore]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [chatHistory, loadingHistory, groupChatMap]);

  return (
    <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}>
      {!groupChat?.join_group ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            flexDirection: "column",
          }}
        >
          {groupChat?.id ? (
            <>
              <Typography.Title level={2} type="danger">
                This is {groupChat?.is_password ? "secret" : "public"} group
              </Typography.Title>
              <Typography.Title level={3} type="secondary">
                Please {groupChat?.is_password && "input password to"} join
                group to see messages
              </Typography.Title>
            </>
          ) : (
            <Typography.Title level={2} type="danger">
              No chat here
            </Typography.Title>
          )}
        </div>
      ) : (
        <>
          <Header />
          <Box
            ref={setRefs}
            className="scrollbar"
            width={"100%"}
            sx={{
              flexGrow: 1,
              height: "100%",
              overflowY: "scroll",
              position: "relative",
            }}
          >
            {isFetching && (
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <ClipLoader color={theme.palette.primary.main} size={30} />
              </Box>
            )}
            <Message menu={true} />
          </Box>
          {groupChat?.join_group ? (
            <Footer scrollToBottom={scrollToBottom} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            ></div>
          )}
        </>
      )}
    </Stack>
  );
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Conversation;
