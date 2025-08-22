const handleLogin = async () => {
  try {
    const response = await fetch("http://10.0.2.2:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password: password,
      }).toString(),
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert("Success", "Logged in!");
      console.log("Token:", data.access_token);
    } else {
      Alert.alert("Error", data.detail || "Login failed");
    }
  } catch (error) {
    Alert.alert("Error", "Something went wrong");
    console.error(error);
  }
};
