import {
    onDocumentWritten,
} from "firebase-functions/v2/firestore";
import {messaging, firestore} from "firebase-admin";

import {getGlicoseStatus} from "./glicoseParameters";


onDocumentWritten("glicoseEntry/{docId}", async (event) => {
    const entry = event.data?.after.data();
    const user = entry?.user;

    if (!entry?.glicose ||
        !(getGlicoseStatus(entry.glicose) === "crit-high" ||
        getGlicoseStatus(entry.glicose) === "crit-low")) {
        return;
    }

    const adms = await firestore().collection("userProfiles")
        .where("isAdm", "==", true).orderBy("fcmToken").get();

    const tokens: string[] = [];
    adms.forEach((item) => tokens.push(item.data().fcmToken));

    if (user && tokens.length) {
        await messaging().sendEachForMulticast({
            tokens,
            notification: {
                title: "Paciente em estado crítico",
                body: `${user.name} está com a glicose de ${entry.glicose}.`,
            },
        });
    }
});
  