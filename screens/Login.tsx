//frontend/screens/Login.tsx
const handleLogin = async () => {
  //pc's IP address
  const API_BASE = "http://192.168.25.1:8000"; 

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert("Success", "Logged in!");
      console.log("Token:", data.access_token);
    } else {

      Alert.alert("Error", data.detail || "Login failed");
    }
  } catch (error) {
    Alert.alert("Error", "Something went wrong. Please check your connection.");
    console.error(error);
  }
};