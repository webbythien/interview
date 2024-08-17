import {
  Box,
  IconButton,
  Stack,
  Typography,
  InputBase,
  Button,
  Divider,
  Avatar,
  Badge,
  AppBar,
  Tabs,
  Tab,
  Checkbox,
} from "@mui/material";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Password,
} from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { ChatList } from "../../data";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import axios from "axios";
import useSettings from "../../hooks/useSettings";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { Form, Input, Modal } from "antd";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
      style={{ maxHeight: "64vh" }}
      className="scrollbar"
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const Chats = () => {
  const {
    setGroupChat,
    setChatHistory,
    setLoadingHistory,
    setGroupChatMap,
    groupChatMap,
    setChatList,
    chatList,
    setChatListUnjoin,
    chatListUnjoin,
  } = useSettings();

  const theme = useTheme();

  const [value, setValue] = React.useState(1);
  const [loadingNew, setLoadingNew] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const BASE_URL = `${process.env.REACT_APP_API_URL}/v1/api/chat`;
  const ENDPOINT = "/groups/joined";
  const params = {
    limit: 10,
    offset: 0,
    user_uuid: localStorage.getItem("uuid"),
  };

  const getGroups = async () => {
    try {
      // setLoadingHistory(true);
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`, { params });
      console.log("Groups data:", response.data);
      if (response?.data && response.data?.groups?.length > 0) {
        setValue(0);
        setChatList(response.data.groups);
        setGroupChat(response.data.groups[0]);
        setChatHistory(response.data.groups[0].id);
        setGroupChatMap((prev) => ({
          ...prev,
          [response.data.groups[0].id]: [],
        }));
      }
    } catch (error) {
      setLoadingHistory(false);
      console.error("Error fetching groups:", error);
      throw error; // You might want to handle this error further in your application
    }
  };

  const getUnjoinedGroups = async () => {
    try {
      // setLoadingHistory(true);
      const response = await axios.get(`${BASE_URL}/groups/not-joined`, {
        params,
      });
      console.log("Unjoined groups data:", response.data);
      if (response?.data && response.data?.groups?.length > 0) {
        setChatListUnjoin(response.data.groups);
      }
    } catch (error) {
      // setLoadingHistory(false);
      console.error("Error fetching unjoined groups:", error);
      throw error; // Handle this error appropriately in your application
    } finally {
      // setLoadingHistory(false); // Ensure loading state is reset
    }
  };

  useEffect(() => {
    getGroups();
    getUnjoinedGroups();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // const handlePassword = (text) => {
  //   console.log("onChange:", text);
  // };

  const [usePassword, setUsePassword] = useState(false);

  const handleChangeCheckBox = (e) => {
    setUsePassword(e.target.checked);
  };

  const onFinish = async (values) => {
    try {
      setLoadingNew(true);
      const payload = {
        name: values.groupname,
        user_uuid: localStorage.getItem("uuid"),
        username: localStorage.getItem("username"),
        password: usePassword ? values.password : null,
      };

      console.log("Sending payload:", payload); // For debugging

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/groups`,
        payload,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);
      setIsModalOpen(false);
      handleCancel(); // Close the modal
      getGroups(); // Refresh the groups list
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoadingNew(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <Modal
        title="Add new group"
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Group Name"
            name="groupname"
            style={{ width: "100%" }}
            rules={[
              {
                required: true,
                message: "Please input your group name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: usePassword,
                message: "Please input group password!",
              },
            ]}
            style={{ width: "100%" }}
          >
            <Input.Password
              prefix={
                <Checkbox
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                />
              }
              disabled={!usePassword}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit" loading={loadingNew}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Box
        sx={{
          position: "relative",
          width: 320,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        }}
      >
        <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5">Chats</Typography>
            <IconButton>
              <CircleDashed />
            </IconButton>
          </Stack>

          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search..."
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ArchiveBox size={24} />
              <Button onClick={showModal}>New Group</Button>
            </Stack>
            <Divider />
          </Stack>

          <Stack
            className="scrollbar"
            spacing={2}
            direction="column"
            sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
          >
            <Box sx={{}}>
              <AppBar position="static">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  sx={{ background: "#F4DEB3", padding: "8px" }}
                >
                  <Tab label="Groups Joined" {...a11yProps(0)} />
                  <Tab label="Groups Unjoined" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              <SwipeableViews
                // axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={value}
                onChangeIndex={handleChangeIndex}
              >
                <TabPanel value={value} index={0}>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      All Groups Joined
                    </Typography>
                    {chatList.length > 0 ? (
                      chatList.map((el) => {
                        return (
                          <ChatElement
                            setValue={setValue}
                            key={el.id + ""}
                            {...el}
                          />
                        );
                      })
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div style={{ width: "32%" }}>
                          <img
                            style={{ width: "100%", height: "100%" }}
                            src="https://cdn.icon-icons.com/icons2/3179/PNG/512/team_people_man_woman_group_icon_193969.png"
                            alt="No Group"
                          />
                        </div>
                        No group yet
                      </div>
                    )}
                  </Stack>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      All Groups Unjoined
                    </Typography>
                    {chatListUnjoin.length > 0 ? (
                      chatListUnjoin.map((el) => {
                        return (
                          <ChatElement
                            setValue={setValue}
                            key={el.id + ""}
                            {...el}
                          />
                        );
                      })
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div style={{ width: "32%" }}>
                          <img
                            style={{ width: "100%", height: "100%" }}
                            src="https://cdn.icon-icons.com/icons2/3179/PNG/512/team_people_man_woman_group_icon_193969.png"
                            alt="No Group"
                          />
                        </div>
                        No group yet
                      </div>
                    )}
                  </Stack>
                </TabPanel>
              </SwipeableViews>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Chats;
