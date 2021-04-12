import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { Camera, FileSystem } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import styled, { ThemeConsumer } from "styled-components";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Entypo,
  FontAwesome,
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ALBUM_NAME = "Camera";

const CenterView = styled.View`
  background-color: black;
`;

const Text = styled.Text`
  color: white;
  font-size: 22px;
`;

const IconBar = styled.View`
  margin-top: 30px;
`;

const IconBarAfter = styled.View`
  margin-top: 30px;
`;

const IconContainer = styled.View`
  width: 100%;
  flex-direction: row;
  padding-bottom: 120px;
  justify-content: space-around;
  align-items: center;
`;

const IconContainerAfter = styled.View`
  width: 100%;
  height: 22%;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPermission: null,
      cameraType: Camera.Constants.Type.front,
      image: null,
      isPreview: false,
    };
    this.cameraRef = React.createRef();
  }

  componentDidMount = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      this.setState({ hasPermission: true });
    } else {
      this.setState({ hasPermission: false });
    }
  };

  render() {
    const { hasPermission, cameraType, isPreview } = this.state;
    if (hasPermission === true) {
      return (
        <CenterView>
          <Camera
            style={{
              width: width - 1,
              height: height / 1.4,
              marginTop: 50,
            }}
            type={cameraType}
            ref={this.cameraRef}
          />
          {!isPreview && (
            <IconContainer>
              <IconBar>
                <TouchableOpacity onPress={this.getPhotos}>
                  <AntDesign name="picture" color="white" size={30} />
                </TouchableOpacity>
              </IconBar>
              <IconBar>
                <TouchableOpacity onPress={this.takePhoto}>
                  <MaterialCommunityIcons
                    name="circle-slice-8"
                    color="white"
                    size={100}
                  />
                </TouchableOpacity>
              </IconBar>
              <IconBar>
                <TouchableOpacity onPress={this.switchCameraType}>
                  <MaterialCommunityIcons
                    name={
                      cameraType === Camera.Constants.Type.front
                        ? "camera-retake-outline"
                        : "camera-retake-outline"
                    }
                    color="white"
                    size={50}
                  />
                </TouchableOpacity>
              </IconBar>
            </IconContainer>
          )}
          <IconContainerAfter>
            <IconBarAfter>
              <TouchableOpacity onPress={this.submitBtn}>
                <FontAwesome name="check-circle" color="black" size={40} />
              </TouchableOpacity>
            </IconBarAfter>
            <IconBarAfter>
              <TouchableOpacity onPress={this.cancelPreviewBtn}>
                <Entypo name="circle-with-cross" color="black" size={40} />
              </TouchableOpacity>
            </IconBarAfter>
          </IconContainerAfter>
        </CenterView>
      );
    } else if (hasPermission === false) {
      return (
        <CenterView>
          <Text>Don't have permissions for this</Text>
        </CenterView>
      );
    } else {
      return (
        <CenterView>
          <ActivityIndicator />
        </CenterView>
      );
    }
  }
  switchCameraType = () => {
    const { cameraType } = this.state;
    if (cameraType === Camera.Constants.Type.front) {
      this.setState({ cameraType: Camera.Constants.Type.back });
    } else {
      this.setState({ cameraType: Camera.Constants.Type.front });
    }
  };
  takePhoto = async () => {
    try {
      if (this.cameraRef.current) {
        let { uri } = await this.cameraRef.current.takePictureAsync({
          quality: 1,
          exif: true,
        });
        if (uri) {
          this.savePhoto(uri);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  savePhoto = async (uri) => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumsAsync(ALBUM_NAME);
        if (album === null) {
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
        setTimeout(() => null, 2000);
      } else {
        this.setState({ hasPermission: false });
      }
    } catch (error) {
      console.log("error");
    }
  };
  getPhoto = async () => {
    try {
      const { edges } = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
        base64: true,
        savePhoto: false,
      });
      console.log("pic", edges);
    } catch (error) {
      console.log("getPhoto", error);
    }
  };

  cancelPreviewBtn = async () => {
    await this.cameraRef.current.resumePreview();
    this.setState({ isPreview: false });
  };

  submitBtn = async (uri) => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (album === null) {
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
      }
    } catch (error) {}
  };
}
