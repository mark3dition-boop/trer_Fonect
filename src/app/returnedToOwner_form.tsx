import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const router = useRouter();
  const { itemId } = useLocalSearchParams();

  
  const handleSubmit = async () => {
    if (!fullName || !studentId) {
      Alert.alert("Error", "All fields are required");
      return;
    }


    // INSERT KE TABLE returned_items
    const { error: dbError } = await supabase
      .from("returned_items")
      .insert({
        item_id: itemId,
        returned_to: "owner",
        receiver_name: fullName,
        receiver_nim: studentId,
      });


    const { error: updateItemError } = await supabase
        .from("items")
        .update({ status: "returned" })
        .eq("id", itemId);
    
    
    if (dbError || updateItemError) {
      console.log(dbError);
      console.log(updateItemError);
      Alert.alert("Error", "An error occurred while submitting the form");
      return;
    }

    Alert.alert("Success", "The item has been successfully returned to " + fullName);

    router.back();
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Owner Information</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Student ID"
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
      />
    

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EEF2FF",
    marginTop: -150,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#0066ff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    backgroundColor: "#4f607a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

});