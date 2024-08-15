import { Box, Stack } from "@mui/material";
import React from "react";
import { Chat_History } from "../../data";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  TimeLine,
} from "./MsgTypes";
import useSettings from "../../hooks/useSettings";
import { ClipLoader } from "react-spinners";
const Message = ({ menu }) => {
  const { chatHistory, loadingHistory } = useSettings();

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {loadingHistory ? (
          <div style={{
            justifyContent: 'center',
            height: '100%',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
          }}>
             <ClipLoader  size={80} speedMultiplier={0.6}/>
          </div>
        ) : (
          chatHistory?.length > 0 ?
          chatHistory.map((el) => {
            switch (el.type) {
              case "divider":
                return <TimeLine el={el} />;
              case "msg":
                switch (el.subtype) {
                  case "img":
                    return <MediaMsg el={el} menu={menu} />;
                  case "doc":
                    return <DocMsg el={el} menu={menu} />;

                  case "link":
                    return <LinkMsg el={el} menu={menu} />;
                  // case 'reply':
                  //     return <ReplyMsg el={el} menu={menu}/>

                  default:
                    return <TextMsg el={el} menu={menu} />;
                }
                break;

              default:
                return <></>;
            }
          }):
          "No data"
        )
        
        
        }
      </Stack>
    </Box>
  );
};

export default Message;
