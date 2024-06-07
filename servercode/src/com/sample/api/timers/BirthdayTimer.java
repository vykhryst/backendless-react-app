package com.sample.api.timers;

import com.backendless.Backendless;
import com.backendless.BackendlessUser;
import com.backendless.logging.Logger;
import com.backendless.messaging.BodyParts;
import com.backendless.persistence.DataQueryBuilder;
import com.backendless.servercode.annotation.BackendlessTimer;
import com.backendless.servercode.extension.TimerExtender;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@BackendlessTimer("{'startDate':1717833600000,'language':'JAVA','mode':'DRAFT','model':'default','frequency':{'schedule':'daily','repeat':{'every':1}},'timername':'BirthdayTimer'}")
public class BirthdayTimer extends TimerExtender {

    @Override
    public void execute() {
        try {
            String whereClause = "DAYOFMONTH(birthDate) = DAYOFMONTH(NOW()) AND MONTH(birthDate) = MONTH(NOW())";
            DataQueryBuilder queryBuilder = DataQueryBuilder.create();
            queryBuilder.setWhereClause(whereClause);
            List<BackendlessUser> users = Backendless.Data.of(BackendlessUser.class).find(queryBuilder);
            for (BackendlessUser user : users) {
                sendBirthdayEmail(user);
            }
        } catch (Exception e) {
            logError("Error executing BirthdayTimer: " + e.getMessage());
        }
    }

    private void sendBirthdayEmail(BackendlessUser user) {
        try {
            String birthDateString = user.getProperty("birthDate").toString();
            LocalDateTime birthDateTime = LocalDateTime.parse(birthDateString, DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss zzz yyyy"));
            int years = LocalDateTime.now().getYear() - birthDateTime.getYear();
            String subject = "Happy Birthday, " + user.getProperty("username") + "!";
            String message = "Dear " + user.getProperty("username") + ",\n\nCongratulations on your " + years + "th birthday!" +
                    "\n\nWe wish you a wonderful day filled with joy and happiness." +
                    "\n\nBest regards,\nYour Company";
            BodyParts bodyParts = new BodyParts();
            bodyParts.setTextMessage(message);
            Backendless.Messaging.sendEmail(subject, bodyParts, user.getEmail());
        } catch (Exception e) {
            logError("Error sending birthday email to user " + user.getEmail() + ": " + e.getMessage());
        }
    }

    private void logError(String message) {
        Logger logger = Backendless.Logging.getLogger("com.mbaas.BirthdayTimer");
        logger.error(message);
    }
}
