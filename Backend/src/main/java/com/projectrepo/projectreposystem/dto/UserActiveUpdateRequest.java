package com.projectrepo.projectreposystem.dto;

import jakarta.validation.constraints.NotNull;

public class UserActiveUpdateRequest {

    @NotNull(message = "Active flag required")
    private Boolean active;

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
