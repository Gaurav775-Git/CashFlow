import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      console.log(response);
      return response;
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

const signOut = async()=>{
  try {
    await GoogleSignin.signOut();
    console.log("Sign out successful");
    return true;

  } catch (error) {
    console.log("Google Sign-Out error:", error);
    return false;
  }
}

export default signIn;
