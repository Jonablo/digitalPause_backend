import React, { useState } from "react";
import {
  Button,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NativeModules } from "react-native";

const { MyModule } = NativeModules;
/////////////////////
const llamarNativo = async () => {
  try {
    const respuesta = await MyModule.miMetodoNativo("Hola desde React Native con Kotlin!");
    console.log("Respuesta nativa:", respuesta);
  } catch (error) {
    console.error("Error nativo:", error);
  }
};
//////////////////////////////

const checkUsageTime = async () => {
  try {
    const minutes = await MyModule.getScreenTime();
    Alert.alert("Tiempo de uso", `Has usado el celular ${minutes} minutos hoy.`);
  } catch (e:any) {
    // React Native encapsula el código de la promesa en e.code
    if (e.code === 'PERMISO_DENEGADO') {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir el acceso a estadísticas de uso.",
        [
          { text: "Ir a Ajustes", onPress: () => MyModule.openUsageSettings() },
          { text: "Cancelar", style: "cancel" }
        ]
      );
    } else {
      console.error("Otro error detectado:", e.message);
    }
  }
};
/////////////////////
function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  // Estados para los campos
  const [idTutor, setIdTutor] = useState("");
  const [idChild, setIdChild] = useState("");
  const [nota, setNota] = useState("");
  const [fecha, setFecha] = useState("");

  const enviarDatos = async () => {
    const data = {
      idTutor: parseInt(idTutor, 10),
      idChild: parseInt(idChild, 10),
      nota: parseInt(nota, 10),
      fecha: fecha,
    };

    try {
      const response = await fetch("http://10.0.2.2:9000/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Datos enviados correctamente");
      } else {
        Alert.alert("Error", JSON.stringify(result));
      }
    } catch (error) {
      Alert.alert("Error de conexión");
    }
  };

  return (
    <ScrollView
      style={{ paddingTop: safeAreaInsets.top }}
      contentContainerStyle={styles.container}
    >

      <Button title="Prueba de módulo nativo" onPress={checkUsageTime} />

      <Text style={styles.label}>ID Tutor</Text>
      <TextInput
        style={styles.input}
        value={idTutor}
        onChangeText={setIdTutor}
        keyboardType="numeric"
        placeholder="Ingrese ID Tutor"
      />

      <Text style={styles.label}>ID Child</Text>
      <TextInput
        style={styles.input}
        value={idChild}
        onChangeText={setIdChild}
        keyboardType="numeric"
        placeholder="Ingrese ID Child"
      />

      <Text style={styles.label}>Nota</Text>
      <TextInput
        style={styles.input}
        value={nota}
        onChangeText={setNota}
        keyboardType="numeric"
        placeholder="Ingrese Nota"
      />

      <Text style={styles.label}>Fecha</Text>
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DDTHH:MM:SSZ"
      />


      <Button title="Enviar a API" onPress={checkUsageTime} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});

export default App;
