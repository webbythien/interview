// provider === component
import { createContext, useEffect, useRef, useState } from "react";
import { defaultSettings } from "../config";
import useLocalStorage from "../hooks/useLocalStorage";
import getColorPresets, {
  defaultPreset,
  colorPresets,
} from "../utils/getColorPresets";
import io from "socket.io-client";
import axios from "axios";
import SoundRecieve from "../assets/messenger-notification-sound-effect.mp3";

const initialState = {
  ...defaultSettings,

  // Mode
  onToggleMode: () => {},
  onChangeMode: () => {},

  // Direction
  onToggleDirection: () => {},
  onChangeDirection: () => {},
  onChangeDirectionByLang: () => {},

  // Layout
  onToggleLayout: () => {},
  onChangeLayout: () => {},

  // Contrast
  onToggleContrast: () => {},
  onChangeContrast: () => {},

  // Color
  onChangeColor: () => {},
  setColor: defaultPreset,
  colorOption: [],

  // Stretch
  onToggleStretch: () => {},

  // Reset
  onResetSetting: () => {},
};

const SettingsContext = createContext(initialState);

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useLocalStorage("settings", {
    themeMode: initialState.themeMode,
    themeLayout: initialState.themeLayout,
    themeStretch: initialState.themeStretch,
    themeContrast: initialState.themeContrast,
    themeDirection: initialState.themeDirection,
    themeColorPresets: initialState.themeColorPresets,
  });

  const isArabic = localStorage.getItem("i18nextLng") === "ar";

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang("ar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  // Mode

  const onToggleMode = () => {
    setSettings({
      ...settings,
      themeMode: settings.themeMode === "light" ? "dark" : "light",
    });
  };

  const onChangeMode = (event) => {
    setSettings({
      ...settings,
      themeMode: event.target.value,
    });
  };

  // Direction

  const onToggleDirection = () => {
    setSettings({
      ...settings,
      themeDirection: settings.themeDirection === "rtl" ? "ltr" : "rtl",
    });
  };

  const onChangeDirection = (event) => {
    setSettings({
      ...settings,
      themeDirection: event.target.value,
    });
  };

  const onChangeDirectionByLang = (lang) => {
    setSettings({
      ...settings,
      themeDirection: lang === "ar" ? "rtl" : "ltr",
    });
  };

  // Layout

  const onToggleLayout = () => {
    setSettings({
      ...settings,
      themeLayout:
        settings.themeLayout === "vertical" ? "horizontal" : "vertical",
    });
  };

  const onChangeLayout = (event) => {
    setSettings({
      ...settings,
      themeLayout: event.target.value,
    });
  };

  // Contrast

  const onToggleContrast = () => {
    setSettings({
      ...settings,
      themeContrast: settings.themeContrast === "default" ? "bold" : "default",
    });
  };

  const onChangeContrast = (event) => {
    setSettings({
      ...settings,
      themeContrast: event.target.value,
    });
  };

  // Color

  const onChangeColor = (event) => {
    setSettings({
      ...settings,
      themeColorPresets: event.target.value,
    });
  };

  // Stretch

  const onToggleStretch = () => {
    setSettings({
      ...settings,
      themeStretch: !settings.themeStretch,
    });
  };

  // Reset

  const onResetSetting = () => {
    setSettings({
      themeMode: initialState.themeMode,
      themeLayout: initialState.themeLayout,
      themeStretch: initialState.themeStretch,
      themeContrast: initialState.themeContrast,
      themeDirection: initialState.themeDirection,
      themeColorPresets: initialState.themeColorPresets,
    });
  };

  const [groupChat, setGroupChat] = useState(0);
  const [uuidLogin, setUuidLogin] = useState(null);
  const [groupChatMap, setGroupChatMap] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [chatList, setChatList] = useState([])
  const [chatListUnjoin, setChatListUnjoin] = useState([])
  const [hasMore, setHasMore] = useState(true);

  const [loadingHistory, setLoadingHistory] = useState(true);

  // const [play, { sound }] = useSound(SoundRecieve, { volume: 1.0 });

  const connectSocket = () => {
    const userId = localStorage.getItem("uuid") || uuidLogin;
    const socket = io(process.env.REACT_APP_SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to the Socket.io server", socket.id);

      socket.emit("subscribe", { room_id: `${userId}` });

      socket.off("message");

      console.log("zoooooooooooooooooooo")
      socket.on("message", (data) => {
        const { task_id, receiver_id, ...restData } = data;
        console.log("socket chat : ", data)
        setGroupChatMap((prevGroupChatMap) => {
          if (prevGroupChatMap[receiver_id]) {
            const index = prevGroupChatMap[receiver_id].findIndex(
              (item) => item.id === data.task_id
            );
            console.log("index: ",index)
            if (index > -1) {
              const updatedMessages = [...prevGroupChatMap[receiver_id]];
              updatedMessages[index] = restData;
              return {
                ...prevGroupChatMap,
                [receiver_id]: updatedMessages,
              };
            } else {
              const audioElement = new Audio(SoundRecieve);
            
              audioElement.play().then(() => {
                console.log("Sound played successfully");
              }).catch(error => {
                console.error("Error playing sound:", error);
              });
              setUnreadMap((prevUnread) => (
                {
                ...prevUnread,
                [receiver_id]:
                  typeof prevUnread[receiver_id] === "number" &&
                  prevUnread[receiver_id] > 0
                    ? prevUnread[receiver_id] + 1
                    : 1,
              }));
              
              const a = {
                ...prevGroupChatMap,
                [receiver_id]: [...prevGroupChatMap[receiver_id], restData],
                };
              console.log("prevGroupChatMap : ",a)

              return a
            }
          } else {
            console.log("prevGroupChatMap : ",prevGroupChatMap)
            const audioElement = new Audio(SoundRecieve);
            
            audioElement.play().then(() => {
              console.log("Sound played successfully");
            }).catch(error => {
              console.error("Error playing sound:", error);
            });

            setUnreadMap((prevUnread) => ({
              ...prevUnread,
              [receiver_id]:
                typeof prevUnread[receiver_id] === "number" &&
                prevUnread[receiver_id] > 0
                  ? prevUnread[receiver_id] + 1
                  : 1,
            }));
            return {
              ...prevGroupChatMap,
              [receiver_id]: [restData],
            };
          }
        });

        setChatList(prevList => {
          const index = prevList.findIndex(chat => chat.id === receiver_id);
  
          if (index !== -1) {
            const updatedChat = { ...prevList[index] };
            
            const newList = prevList.filter(chat => chat.id !== receiver_id);
            
            return [updatedChat, ...newList];
          }
          
          return prevList;
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the Socket.io server", socket.id);
    });

    socket.on("error", (e) => {
      console.log("Error", e);
    });

    return () => {
      socket.disconnect();
    };
  };

  useEffect(() => {
    connectSocket();
  }, [uuidLogin]);

  const fetchMessages = async (groupId, limit, offset, startId = null) => {
    try {
      if (!groupId){
        setLoadingHistory(false);
        return 
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/v1/api/chat/groups/${groupId}/messages`,
        {
          params: {
            limit,
            offset,
            start_id: startId,
          },
        }
      );
      setChatHistory(response.data.messages);
      setLoadingHistory(false);
      setGroupChatMap((prev) => ({
        ...prev,
        [groupId]: response.data.messages,
      }));
    } catch (error) {
      setLoadingHistory(false);
      console.error("Error fetching messages:", error);
      setGroupChatMap({})
      // throw error; // Optionally rethrow the error to be handled by the calling code
    }
  };
  useEffect(() => {
    fetchMessages(groupChat?.id);
  }, [groupChat]);

  const boxChatRef = useRef(null);

  return (
    <SettingsContext.Provider
      value={{
        ...settings, // Mode
        onToggleMode,
        onChangeMode,

        // Direction
        onToggleDirection,
        onChangeDirection,
        onChangeDirectionByLang,

        // Layout
        onToggleLayout,
        onChangeLayout,

        // Contrast
        onChangeContrast,
        onToggleContrast,

        // Stretch
        onToggleStretch,

        // Color
        onChangeColor,
        setColor: getColorPresets(settings.themeColorPresets),
        colorOption: colorPresets.map((color) => ({
          name: color.name,
          value: color.main,
        })),

        // Reset
        onResetSetting,

        groupChat,
        setGroupChat,
        chatHistory,
        setChatHistory,
        loadingHistory,
        setLoadingHistory,
        groupChatMap,
        setGroupChatMap,
        setUnreadMap,
        unreadMap,
        setChatList,
        chatList,
        setChatListUnjoin,
        chatListUnjoin,
        boxChatRef,
        setUuidLogin,
        hasMore,
        setHasMore
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };

export default SettingsProvider;
