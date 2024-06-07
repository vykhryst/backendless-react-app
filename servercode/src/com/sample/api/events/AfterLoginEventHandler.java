package com.sample.api.events;

import com.backendless.BackendlessUser;
import com.backendless.async.callback.AsyncCallback;
import com.backendless.exceptions.BackendlessFault;
import com.backendless.servercode.ExecutionResult;
import com.backendless.servercode.RunnerContext;
import com.backendless.servercode.extension.UserExtender;
import com.backendless.Backendless;

import java.util.Map;


public class AfterLoginEventHandler extends UserExtender {

    public static final String USERS_ONLINE = "usersOnline";
    public static final String STATISTIC = "Statistic";

    @Override
    public void afterLogin(RunnerContext context, String login, String password, ExecutionResult<BackendlessUser> result) throws Exception {
        Backendless.Data.of(STATISTIC).findFirst(new AsyncCallback<>() {
            @Override
            public void handleResponse(Map response) {
                if (response != null) {
                    Integer usersOnline = (Integer) response.get(USERS_ONLINE);
                    usersOnline++;
                    Backendless.Data.of(STATISTIC).save(Map.of("objectId", response.get("objectId"), USERS_ONLINE, usersOnline));
                }
            }

            @Override
            public void handleFault(BackendlessFault fault) {
                Backendless.Data.of(STATISTIC).save(Map.of(USERS_ONLINE, 1));
            }
        });
    }
}
