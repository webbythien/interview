import { Box, Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import useSettings from "../../hooks/useSettings";

const Conversation = () => {
  const theme = useTheme();
  const boxRef = useRef(null);
  const { chatHistory, loadingHistory, groupChat } = useSettings();

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [chatHistory, loadingHistory]);

  return (
    <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}>
      {/* Chat header */}
      <Header />
      {/* Msg */}
      <Box
        ref={boxRef}
        className="scrollbar"
        width={"100%"}
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      >
        <Message menu={true} />
      </Box>
      {/* Chat footer */}
      {groupChat?.join_group ? (
        <Footer />
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
    </Stack>
  );
};

export default Conversation;
