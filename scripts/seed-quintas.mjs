import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

function cargarEnvLocal() {
  const contenido = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  for (const linea of contenido.split("\n")) {
    const [clave, ...resto] = linea.split("=");
    if (clave && resto.length > 0) {
      process.env[clave.trim()] = resto.join("=").trim();
    }
  }
}

cargarEnvLocal();

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

await signInAnonymously(auth);

const quintas = {
  "quinta-serrano-1": {
    nombre: "Quinta Serrano 1",
    capacidadBase: 50,
    precioSemana: 300000,
    precioFinde: 350000,
    costoPersonaExtra: 0,
    horarioInicio: "10:00",
    horarioFin: "19:00",
    costoHoraExtra: 0,
    porcentajeSeña: 30,
  },
  "quinta-serrano-2": {
    nombre: "Quinta Serrano 2",
    capacidadBase: 40,
    precioSemana: 250000,
    precioFinde: 300000,
    costoPersonaExtra: 0,
    horarioInicio: "10:00",
    horarioFin: "19:00",
    costoHoraExtra: 0,
    porcentajeSeña: 30,
  },
};

for (const [id, datos] of Object.entries(quintas)) {
  await setDoc(doc(db, "quintas", id), datos);
  console.log(`Documento quintas/${id} escrito.`);
}

process.exit(0);
