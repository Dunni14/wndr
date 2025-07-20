import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { requestOTP, verifyOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handlePhoneSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestOTP(phone);
      if (res.message === "OTP sent") {
        setOtpRequested(true);
        setStep("verify");
      } else {
        setError(res.error || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(phone, code);
      if (res.token) {
        login(res.user, res.token);
        navigation.navigate("Map");
      } else {
        setError(res.error || "OTP verification failed");
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Map Login</Text>
      {step === "request" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title={loading ? "Sending..." : "Send OTP"} onPress={handlePhoneSubmit} disabled={loading} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
            editable={!loading}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title={loading ? "Verifying..." : "Verify OTP"} onPress={handleOTPSubmit} disabled={loading || code.length !== 6 || !otpRequested} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: { width: 240, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 },
  error: { color: "red", marginBottom: 8 },
});

export default Login; 