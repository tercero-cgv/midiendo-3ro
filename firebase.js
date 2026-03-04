// ============================================================
//  FIREBASE CONFIG — Midiendo Nuestro Mundo (3er Grado, CGV)
//  Conecta tu proyecto Firebase aquí antes de publicar.
// ============================================================

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// ------------------------------------------------------------
//  Inicialización
// ------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, getDocs, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ------------------------------------------------------------
//  API pública usada por la app
// ------------------------------------------------------------

/** Devuelve todos los estudiantes registrados */
export async function getStudents() {
  const snap = await getDocs(collection(db, "students"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Crea o actualiza un estudiante */
export async function saveStudent({ id, name, code }) {
  await setDoc(doc(db, "students", id), { name, code }, { merge: true });
}

/** Elimina un estudiante */
export async function deleteStudent(id) {
  const { deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  await deleteDoc(doc(db, "students", id));
}

/** Guarda el progreso de una actividad para un estudiante */
export async function saveProgress(studentId, activityId, { score, completed, stars }) {
  const ref = doc(db, "progress", `${studentId}_${activityId}`);
  await setDoc(ref, {
    studentId, activityId, score, completed, stars,
    timestamp: new Date().toISOString()
  }, { merge: true });
}

/** Obtiene todo el progreso de un estudiante */
export async function getStudentProgress(studentId) {
  const snap = await getDocs(collection(db, "progress"));
  const results = {};
  snap.docs.forEach(d => {
    const data = d.data();
    if (data.studentId === studentId) results[data.activityId] = data;
  });
  return results;
}

/** Obtiene todo el progreso (para panel maestro) */
export async function getAllProgress() {
  const snap = await getDocs(collection(db, "progress"));
  return snap.docs.map(d => d.data());
}

/** Lee/escribe el estado de candados por semana/actividad */
export async function getLocks() {
  const snap = await getDoc(doc(db, "config", "locks"));
  return snap.exists() ? snap.data() : {};
}

export async function saveLocks(locks) {
  await setDoc(doc(db, "config", "locks"), locks);
}

/** Escucha cambios en tiempo real en candados */
export function onLocksChange(callback) {
  return onSnapshot(doc(db, "config", "locks"), snap => {
    callback(snap.exists() ? snap.data() : {});
  });
}

export { db };
