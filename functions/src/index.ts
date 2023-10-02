
import * as admin from "firebase-admin";
admin.initializeApp() 

import {
    firestore,
    logger
} from "firebase-functions";

import { UserProfileDbType } from "./@types/db/userProfile";
import { getGlicoseStatus } from "./glicoseParameters";

exports['send-glicose-notification'] = firestore.document('userProfiles/{docId}').onUpdate(async (event) => {
    const userBefore = event.before.data() as UserProfileDbType;
    const userAfter = event.after.data() as UserProfileDbType;

    if(!userAfter?.lastGlicoseEntry?.glicose) {
        logger.log("[send-glicose-notification] No 'lastGlicoseEntry' on current user.");
        return;
    }

    if(getGlicoseStatus(userAfter.lastGlicoseEntry.glicose) !== "crit-high" &&
        getGlicoseStatus(userAfter.lastGlicoseEntry.glicose) !== "crit-low") {
        logger.log("[send-glicose-notification] Current user glicose not critical.");
        return;
    }

    if(userBefore?.lastGlicoseEntry?.glicose && (getGlicoseStatus(userBefore.lastGlicoseEntry.glicose) === "crit-high" || 
        getGlicoseStatus(userBefore.lastGlicoseEntry.glicose) === "crit-low")) {
        logger.log("[send-glicose-notification] Previous user glicose not critical or not set.");
        return;
    }

    const adms = await admin.firestore().collection("userProfiles")
        .where("isAdm", "==", true).orderBy("fcmToken").get();

    const tokens: string[] = [];
    adms.forEach((item) => tokens.push(item.data().fcmToken));

    if (!tokens.length) {
        logger.log("[send-glicose-notification] Not manager tokens registered.");
        return;
    }

    await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
            title: "Paciente em estado crítico",
            body: `${userAfter?.name ? userAfter.name : 'Seu paciente'} está com a glicose de ${userAfter.lastGlicoseEntry.glicose}.`,
        },
        data: {
            user: JSON.stringify(userAfter)
        }
    });
});