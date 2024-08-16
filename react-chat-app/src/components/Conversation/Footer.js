import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Camera,
  File,
  Image,
  Sticker,
  User,
} from "phosphor-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Modal } from "@mui/material";
import useSettings from "../../hooks/useSettings";
import axios from "axios";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px",
    paddingBottom: "12px",
  },
}));

const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 105,
    title: "Photo",
  },
  // {
  //   color: "#0159b2",
  //   icon: <File size={24} />,
  //   y: 180,
  //   title: "Document",
  // },
];

const ChatInput = ({ setOpenPicker, setMessage, message, setFileList, onEnter }) => {
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onEnter();
    }
  };
  const [openAction, setOpenAction] = useState(false);

  const handleFileSelect = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    if (type === "Photo") {
      input.accept = "image/*";
    } else if (type === "Document") {
      input.accept = ".doc,.docx,.pdf,.txt";
    } else {
      return;
    }

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newFileList = files.map((file) => ({
        uid: `rc-upload-${Date.now()}-${file.name}`,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(file),
        originFileObj: file,
      }));

      setFileList((prevFileList) => [...prevFileList, ...newFileList]);
      setOpenAction(false);
    };

    input.click();
  };

  return (
    <StyledInput
      fullWidth
      placeholder="Write a message..."
      variant="filled"
      value={message}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <Stack sx={{ width: "max-content" }}>
            <Stack
              sx={{
                position: "relative",
                display: openAction ? "inline-block" : "none",
              }}
            >
              {Actions.map((el) => (
                <Tooltip placement="right" title={el.title}>
                  <Fab
                    sx={{
                      position: "absolute",
                      top: -el.y,
                      backgroundColor: el.color,
                    }}
                    onClick={() => handleFileSelect(el.title)}
                  >
                    {el.icon}
                  </Fab>
                </Tooltip>
              ))}
            </Stack>
            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenAction((prev) => !prev);
                }}
              >
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
        endAdornment: (
          <InputAdornment>
            <IconButton
              onClick={() => {
                setOpenPicker((prev) => !prev);
              }}
            >
              <Smiley />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

const Footer = () => {
  const theme = useTheme();
  const { groupChat, setChatHistory, setGroupChatMap } = useSettings();
  const [message, setMessage] = useState("");

  const [openPicker, setOpenPicker] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ fileList: newFileList }) => {
    console.log("newFileList: ", newFileList);
    setFileList(newFileList);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const uploadFiles = async () => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/upload-files`,
        {
          method: "POST",
          body: formData,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const uploadedFiles = fileList.map((file, index) => ({
        ...file,
        status: "done",
        url: result[index].url,
      }));

      setFileList(uploadedFiles);
      setUploading(false);
      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };
  const handleSubmit = async () => {
    if (fileList.length <= 0 && (message === "" || message === null)) {
      return;
    }
    let uploadedUrls = [];
    const data = {
      sender_uuid: localStorage.getItem("uuid"),
      receiver_id: groupChat.id,
      message: message,
      files: [],
    };

    if (fileList.length > 0) {
      uploadedUrls = await uploadFiles();
      data.files = uploadedUrls.map((file) => ({
        url: file.url,
        type: file.type,
        filename: file.filename,
      }));
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/conversations`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message sent successfully: ", response);
      const responseData = response.data;

      const temp = {
        type: "msg",
        message: message,
        sent: 1,
        id: responseData.task_id,
        uuid: localStorage.getItem("uuid"),
        created_at: new Date().toISOString(),
        subtype: fileList.length > 0 ? "img" : null,
        img: uploadedUrls.map((file) => file.url),
      };

      // setChatHistory((prevChatHistory) => [...prevChatHistory, temp]);
      setGroupChatMap((prev) => ({
        ...prev,
        [groupChat.id]: [...(prev[groupChat.id] || []), temp],
      }));
    } catch (error) {
      console.error("Error sending message", error);
    }

    // Reset the file list and message input after sending
    setFileList([]);
    setMessage("");
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack direction="row" alignItems={"center"} spacing={3}>
        {fileList.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "90px",
              width: "75%",
              background: "white",
              padding: "16px",
              borderRadius: "16px",
            }}
          >
            <Upload
              onPreview={handlePreview}
              onChange={handleChange}
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
            >
              {fileList.length >= 4 ? null : uploadButton}
            </Upload>
            {uploading && (
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ mt: 2 }}
              />
            )}
            {previewOpen && (
              <Modal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                aria-labelledby="preview-modal"
                aria-describedby="preview-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "auto",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "80vh" }}
                  />
                </Box>
              </Modal>
            )}
          </div>
        )}
        <Stack sx={{ width: "100%" }}>
          {/* Chat Input */}
          <Box
            sx={{
              display: openPicker ? "inline" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: 81,
              right: 100,
            }}
          >
            <Picker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={(e)=>setMessage(prev => `${prev} ${e.native}`)}
            />
          </Box>
          <ChatInput
            setOpenPicker={setOpenPicker}
            setMessage={setMessage}
            message={message}
            setFileList={setFileList}
            onEnter={handleSubmit}
          />
        </Stack>

        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton onClick={handleSubmit} disabled={uploading}>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Footer;
