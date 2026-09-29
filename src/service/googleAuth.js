import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "221110291379-rdoi51n54ugnor8pp07tsj9v2lqpjic1.apps.googleusercontent.com",
});

const signin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      console.log(response);
    } else {
      console.log("signin was cancelled by the user");
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User cancelled Google Sign-In");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("Google Sign-In already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("Google Play Services unavailable");
    } else {
      console.log("Google Sign-In error:", error);
    }
  }
};

export default signin;
