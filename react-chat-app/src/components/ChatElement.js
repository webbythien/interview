import { Avatar, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import StyledBadge from "./StyledBadge";
import useSettings from "../hooks/useSettings";
import axios from "axios";
import { useState } from "react";
import { Form, Input, Modal, Tooltip } from "antd";
import toast, { Toaster } from "react-hot-toast";

//single chat element
const ChatElement = ({
  id,
  name,
  img,
  msg,
  time,
  online,
  unread,
  member_count,
  recent_senders,
  sent,
  join_group,
  is_password,
  setValue,
  setHasMore,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const {
    groupChat,
    setGroupChat,
    setLoadingHistory,
    groupChatMap,
    unreadMap,
    setUnreadMap,
    setChatList,
    setChatListUnjoin,
    boxChatRef,
  } = useSettings();

  const handleSetGroupChat = () => {
    try {
      // if (!join_group){
      //   return
      // }

      if (groupChat.id !== id) {
        setLoadingHistory(true);
        setGroupChat({
          id,
          name,
          img,
          msg,
          time,
          online,
          unread,
          member_count,
          recent_senders,
          sent,
          join_group,
          is_password,
        });
      }
      setUnreadMap((prevUnread) => {
        return {
          ...prevUnread,
          [id]: 0,
        };
      });
    } catch (error) {
      setLoadingHistory(false);
    }finally{
      setHasMore(true)
    }
  };

  const handleJoinGroup = async (password = null) => {
    try {
      setLoadingJoin(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/join-group`,
        {
          uuid: localStorage.getItem("uuid"),
          username: localStorage.getItem("username"),
          group_id: id,
          password: password,
        }
      );
      console.log("join group", response.data.group);
      const groupJoin = response.data.group;
      const groupId = groupJoin.id;

      setChatListUnjoin((prevUnjoinList) => {
        const itemToMove = prevUnjoinList.find((item) => item.id === groupId);

        if (itemToMove) {
          const updatedUnjoinList = prevUnjoinList.filter(
            (item) => item.id !== groupId
          );
          // const newItem = itemToMove
          itemToMove.join_group = true;
          setChatList((prevJoinList) => [itemToMove, ...prevJoinList]);

          return updatedUnjoinList;
        }

        return prevUnjoinList;
      });
      toast.success("Join group successfully");
      setValue(0);
      setGroupChat({
        id,
        name,
        img,
        msg,
        time,
        online,
        unread,
        member_count,
        recent_senders,
        sent,
        join_group: true,
        is_password,
      });
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Wrong password");
      console.error("Error joining group:", error);
    } finally {
      setLoadingJoin(false);
    }
  };

  const theme = useTheme();
  const truncateMessage = (msg, charLimit) => {
    if (msg.length > charLimit) {
      return msg.slice(0, charLimit) + "...";
    }
    return msg;
  };

  const onFinish = async (values) => {
    await handleJoinGroup(values.password);
    console.log("Success:", values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const handleDoubleClick = () => {
    if (boxChatRef.current) {
      boxChatRef.current.scrollTop = boxChatRef.current.scrollHeight;
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <Modal
        title="Join group"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        footer={null}
      >
        <Toaster position="top-center" />

        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input password to join group!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit" loading={loadingJoin}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Box
        onClick={handleSetGroupChat}
        onDoubleClick={handleDoubleClick}
        sx={{
          width: "100%",
          borderRadius: 1,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#fff"
              : theme.palette.background.default,
          cursor: "pointer",
          background: `${groupChat.id === id ? "burlywood" : "#fff"}`,
        }}
        p={2}
      >
        <Tooltip placement="top" title={`Group ID: ${id}`}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2}>
              {online ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar src={img} />
                </StyledBadge>
              ) : (
                <Avatar src={img} />
              )}

              <Stack spacing={0.3}>
                <Typography variant="subtitle2">
                  {truncateMessage(name, 16)}
                </Typography>
                {join_group ? (
                  <Typography variant="caption">
                    {truncateMessage(
                      groupChatMap[id]?.length > 0
                        ? groupChatMap[id][groupChatMap[id].length - 1]
                            ?.message === ""
                          ? "attachment"
                          : groupChatMap[id][groupChatMap[id].length - 1]
                              ?.message || msg
                        : msg,
                      7
                    )}
                  </Typography>
                ) : (
                  <Button
                    onClick={() => {
                      is_password ? showModal() : handleJoinGroup();
                    }}
                    loading={true}
                  >
                    Join Group
                  </Button>
                )}
              </Stack>
            </Stack>
            <Stack spacing={2} alignItems="center">
              {/* <Typography sx={{fontWeight:600}} variant='caption'>
                {time}
              </Typography> */}
              <Badge color="primary" badgeContent={unreadMap[id] || 0}></Badge>
            </Stack>
          </Stack>
        </Tooltip>
      </Box>
    </>
  );
};

export default ChatElement;
